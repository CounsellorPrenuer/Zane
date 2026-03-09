import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertMentoriaBookingSchema } from "@shared/schema";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const bookingFormSchema = insertMentoriaBookingSchema.pick({
  contactName: true,
  contactEmail: true,
  contactPhone: true,
}).extend({
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface MentoriaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  tier: string;
  programName: string;
  price: number;
}

export default function MentoriaPaymentModal({
  isOpen,
  onClose,
  category,
  tier,
  programName,
  price,
}: MentoriaPaymentModalProps) {
  const { toast } = useToast();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      return await apiRequest("POST", "/api/mentoria-bookings", {
        ...data,
        category,
        tier,
        programName,
        price: price.toString(),
      });
    },
    onSuccess: (data: any) => {
      // Initiate Razorpay payment
      initiatePayment(data.booking, data.order);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
      });
    },
  });

  const initiatePayment = (booking: any, order: any) => {
    setIsPaymentProcessing(true);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
      amount: order.amount,
      currency: order.currency,
      name: "Academy for Skill and Knowledge",
      description: `${programName} - ${tier === "standard" ? "Standard" : "Premium"} Plan`,
      order_id: order.id,
      handler: async function (response: any) {
        try {
          // Verify payment on backend
          const verifyResponse = await apiRequest("POST", "/api/mentoria-bookings/verify-payment", {
            bookingId: booking.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          setIsPaymentProcessing(false);
          
          toast({
            title: "Payment Successful!",
            description: "Your Mentoria program booking has been confirmed.",
          });

          // Invalidate queries to refresh admin dashboard
          queryClient.invalidateQueries({ queryKey: ["/api/admin/mentoria-bookings"] });
          
          form.reset();
          onClose();
        } catch (error: any) {
          setIsPaymentProcessing(false);
          toast({
            variant: "destructive",
            title: "Payment Verification Failed",
            description: error.message || "Please contact support.",
          });
        }
      },
      prefill: {
        name: form.getValues("contactName"),
        email: form.getValues("contactEmail"),
        contact: form.getValues("contactPhone"),
      },
      theme: {
        color: "#1e40af",
      },
      modal: {
        ondismiss: function() {
          setIsPaymentProcessing(false);
          toast({
            variant: "destructive",
            title: "Payment Cancelled",
            description: "You cancelled the payment process.",
          });
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  const handleClose = () => {
    if (!isPaymentProcessing && !createBookingMutation.isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-mentoria-payment">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Complete Your Purchase
          </DialogTitle>
          <DialogDescription>
            Fill in your details to proceed with payment for {programName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Program Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg">{programName}</h4>
                <p className="text-sm text-muted-foreground">
                  {tier === "standard" ? "Standard Plan" : "Premium Plan"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Category: {category === "8-9" ? "8-9 Students" : 
                           category === "10-12" ? "10-12 Students" :
                           category === "graduates" ? "College Graduates" : "Working Professionals"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₹{price.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">One-time payment</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                        data-testid="input-email"
                      />
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
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        {...field}
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPaymentProcessing || createBookingMutation.isPending}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPaymentProcessing || createBookingMutation.isPending}
                  className="flex-1"
                  data-testid="button-pay-now"
                >
                  {createBookingMutation.isPending || isPaymentProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay ₹{price.toLocaleString()}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
