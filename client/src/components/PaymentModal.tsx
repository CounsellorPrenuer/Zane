import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Loader2, User, Mail, Phone, Calendar, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const paymentFormSchema = z.object({
  contactName: z.string().min(2, "Name must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentType: "consultation" | "workshop";
  title: string;
  amount: number;
  description?: string;
  workshopId?: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  paymentType,
  title,
  amount,
  description,
  workshopId,
}: PaymentModalProps) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
  });

  // Create payment order mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (formData: PaymentFormData) => {
      const paymentData = {
        ...formData,
        amount: amount.toString(),
        paymentType,
        referenceId: workshopId,
        description: description || title,
        currency: 'INR',
        paymentGateway: 'razorpay',
        status: 'pending',
      };

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      return response.json();
    },
  });

  const openRazorpayPayment = (paymentData: any, formData: PaymentFormData) => {
    setIsProcessingPayment(true);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Academy for Skill and Knowledge',
      description: description || title,
      order_id: paymentData.razorpayOrderId || paymentData.gatewayOrderId,
      prefill: {
        name: formData.contactName,
        email: formData.contactEmail,
        contact: formData.contactPhone,
      },
      theme: {
        color: '#2563eb',
      },
      handler: async function (response: any) {
        // Payment success callback - verify payment with server
        try {
          const verificationResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: paymentData.id,
              contactName: formData.contactName,
              contactEmail: formData.contactEmail,
              contactPhone: formData.contactPhone,
              message: formData.message || ''
            }),
          });

          const verificationData = await verificationResponse.json();

          if (!verificationResponse.ok) {
            throw new Error(verificationData.message || 'Payment verification failed');
          }

          toast({
            title: "Payment Successful!",
            description: `Your ${paymentType} booking has been confirmed. Payment ID: ${response.razorpay_payment_id}`,
          });

          reset();
          onClose();
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast({
            title: "Payment Verification Error",
            description: "Payment was processed but verification failed. Please contact support with your payment ID: " + response.razorpay_payment_id,
            variant: "destructive",
          });
        } finally {
          setIsProcessingPayment(false);
        }
      },
      modal: {
        ondismiss: function() {
          setIsProcessingPayment(false);
          toast({
            title: "Payment Cancelled",
            description: "Your payment was cancelled. You can try again anytime.",
            variant: "destructive",
          });
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmit = async (formData: PaymentFormData) => {
    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          // Retry submission after script loads
          createPaymentMutation.mutate(formData, {
            onSuccess: (paymentData) => {
              openRazorpayPayment(paymentData, formData);
            },
            onError: (error) => {
              toast({
                title: "Error",
                description: "Failed to create payment order. Please try again.",
                variant: "destructive",
              });
            },
          });
        };
        document.head.appendChild(script);
        return;
      }

      // Create payment order
      createPaymentMutation.mutate(formData, {
        onSuccess: (paymentData) => {
          openRazorpayPayment(paymentData, formData);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to create payment order. Please try again.",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            {paymentType === 'consultation' ? 'Book Consultation' : 'Register for Workshop'}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">{title}</h3>
          {description && (
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{description}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-blue-600 dark:text-blue-400">Amount to pay:</span>
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
              ₹{amount.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="contactName"
              {...register("contactName")}
              placeholder="Enter your full name"
              data-testid="input-payment-name"
            />
            {errors.contactName && (
              <p className="text-sm text-red-600">{errors.contactName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="contactEmail"
              type="email"
              {...register("contactEmail")}
              placeholder="Enter your email address"
              data-testid="input-payment-email"
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-600">{errors.contactEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="contactPhone"
              {...register("contactPhone")}
              placeholder="Enter your phone number"
              data-testid="input-payment-phone"
            />
            {errors.contactPhone && (
              <p className="text-sm text-red-600">{errors.contactPhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Additional Message (Optional)
            </Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Any specific requirements or questions..."
              rows={3}
              data-testid="input-payment-message"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-payment-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPaymentMutation.isPending || isProcessingPayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              data-testid="button-proceed-payment"
            >
              {createPaymentMutation.isPending || isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ₹{amount.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 text-center mt-4">
          Powered by Razorpay • Secure Payment Gateway
        </div>
      </DialogContent>
    </Dialog>
  );
}