import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMentoriaBookingSchema } from "@shared/schema";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Ticket, CheckCircle2, AlertCircle } from "lucide-react";
import { calculateDiscount, calculateFinalPrice, formatPrice } from "@shared/pricing";

// Define the form schema based on the insert schema
const bookingFormSchema = insertMentoriaBookingSchema.pick({
    contactName: true,
    contactEmail: true,
    contactPhone: true,
    category: true,
    tier: true,
    programName: true,
}).extend({
    contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
    couponCode: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface MentoriaBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: {
        category: string;
        tier: string;
        programName: string;
        price: number;
        subgroup: string;
    };
}

export default function MentoriaBookingModal({
    isOpen,
    onClose,
    plan: incomingPlan,
}: MentoriaBookingModalProps) {
    // Ensure price is a number even if passed as a string/formatted string
    const plan = {
        ...incomingPlan,
        price: typeof incomingPlan.price === 'string' 
            ? parseInt((incomingPlan.price as string).replace(/[^\d]/g, "")) 
            : incomingPlan.price
    };
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponData, setCouponData] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            contactName: "",
            contactEmail: "",
            contactPhone: "",
            category: plan.category,
            tier: plan.tier,
            programName: plan.programName,
            couponCode: "",
        },
    });

    // Reset form ONLY when the modal is opened
    useEffect(() => {
        if (isOpen) {
            form.reset({
                contactName: "",
                contactEmail: "",
                contactPhone: "",
                category: plan.category,
                tier: plan.tier,
                programName: plan.programName,
                couponCode: "",
            });
            setCouponData(null);
            setDiscountAmount(0);
        }
    }, [isOpen]);

    const handleApplyCoupon = async () => {
        const code = form.getValues("couponCode");
        if (!code) return;

        setIsValidatingCoupon(true);
        try {
            // Call the Cloudflare Worker to validate the coupon
            const response = await fetch('https://mentoria-payment-worker.gauravgoodreads.workers.dev/api/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, minAmount: plan.price }),
            });

            const data = await response.json();

            if (data.valid) {
                setCouponData(data.coupon);
                const discount = calculateDiscount(
                    plan.price,
                    data.coupon.discountType,
                    data.coupon.discountValue,
                    data.coupon.maxDiscount
                );
                setDiscountAmount(discount);
                toast({
                    title: "Coupon Applied!",
                    description: `You saved ${formatPrice(discount)}`,
                });
            } else {
                setCouponData(null);
                setDiscountAmount(0);
                toast({
                    title: "Invalid Coupon",
                    description: data.message || "Please check the code and try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to validate coupon. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const finalPrice = calculateFinalPrice(plan.price, discountAmount);

    const onSubmit = async (data: BookingFormData) => {
        setIsSubmitting(true);
        try {
            // 1. Create Razorpay Order via Cloudflare Worker
            const orderResponse = await fetch('https://mentoria-payment-worker.gauravgoodreads.workers.dev/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: finalPrice,
                    currency: 'INR',
                    notes: {
                        category: plan.category,
                        tier: plan.tier,
                        programName: plan.programName,
                        contactName: data.contactName,
                    },
                }),
            });

            if (!orderResponse.ok) throw new Error("Failed to create order");
            const order = await orderResponse.json();

            // 2. Save Booking to Main Backend (initially pending)
            // Use Cloudflare Worker for booking persistence
            const backendUrl = 'https://mentoria-payment-worker.gauravgoodreads.workers.dev';
            
            const bookingResponse = await fetch(`${backendUrl}/api/create-pending-booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contactName: data.contactName,
                    contactEmail: data.contactEmail,
                    contactPhone: data.contactPhone,
                    category: plan.category,
                    tier: plan.tier,
                    programName: plan.programName,
                    orderId: order.id,
                    couponCode: couponData?.code || null,
                }),
            });

            if (!bookingResponse.ok) throw new Error("Failed to save booking");
            const { booking } = await bookingResponse.json();

            // 3. Open Razorpay Checkout
            const options = {
                key: "rzp_live_ZDRBsLXKmZI6Gu",
                amount: order.amount,
                currency: order.currency,
                name: "Zane E. Cuxton",
                description: `${plan.programName} - ${plan.tier}`,
                order_id: order.id,
                handler: async (response: any) => {
                    // 4. Verify Payment via Cloudflare Worker
                    const verifyRes = await fetch('https://mentoria-payment-worker.gauravgoodreads.workers.dev/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: booking.id, // Notification for backend
                        }),
                    });

                    if (verifyRes.ok) {
                        toast({
                            title: "Payment Successful!",
                            description: "Your mentorship plan is active. We'll contact you soon.",
                        });
                        onClose();
                    } else {
                        toast({
                            title: "Payment Verification Failed",
                            description: "Please contact support with your payment ID.",
                            variant: "destructive",
                        });
                    }
                },
                prefill: {
                    name: data.contactName,
                    email: data.contactEmail,
                    contact: data.contactPhone,
                },
                theme: {
                    color: "#0f172a",
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error(error);
            toast({
                title: "Booking Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] bg-background/95 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-chart-1 to-chart-1/50" />

                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Complete Your Purchase
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        You are subscribing to <span className="font-semibold text-foreground">{plan.programName}</span> ({plan.tier}) for <span className="font-semibold text-foreground">{plan.subgroup}</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="contactName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your name" {...field} className="bg-background/50" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contactEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="email@example.com" {...field} className="bg-background/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+91 12345 67890" {...field} className="bg-background/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <label className="text-sm font-medium mb-2 block">Apply Coupon</label>
                            <div className="flex gap-2">
                                <FormField
                                    control={form.control}
                                    name="couponCode"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <div className="relative">
                                                    <Ticket className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Enter code"
                                                        {...field}
                                                        className="pl-9 bg-background/50 uppercase"
                                                    />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleApplyCoupon}
                                    disabled={isValidatingCoupon || !form.watch("couponCode")}
                                    className="bg-background/50"
                                >
                                    {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-accent/50 border border-border/50 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Original Price</span>
                                <span>{formatPrice(plan.price)}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Discount ({couponData?.code})
                                    </span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-border font-bold text-lg">
                                <span>Total Amount</span>
                                <span className="text-chart-1">{formatPrice(finalPrice)}</span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-gradient-to-r from-chart-1 to-chart-1/80 hover:shadow-lg hover:shadow-chart-1/20 transition-all duration-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Buy Now ${formatPrice(finalPrice)}`
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
