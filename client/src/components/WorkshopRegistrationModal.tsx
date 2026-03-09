import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkshopRegistrationSchema } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const workshopRegistrationSchema = insertWorkshopRegistrationSchema.pick({
  workshopTitle: true,
  contactName: true,
  contactEmail: true,
  contactPhone: true,
  notes: true,
}).extend({
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  notes: z.string().optional(),
});

type WorkshopRegistrationFormData = z.infer<typeof workshopRegistrationSchema>;

interface WorkshopRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopTitle: string;
  workshopDescription: string;
}

export default function WorkshopRegistrationModal({
  isOpen,
  onClose,
  workshopTitle,
  workshopDescription,
}: WorkshopRegistrationModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<WorkshopRegistrationFormData>({
    resolver: zodResolver(workshopRegistrationSchema),
    defaultValues: {
      workshopTitle,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    },
  });

  const onSubmit = async (data: WorkshopRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      // Step 1: Save to Database
      const response = await fetch('/api/workshop-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save registration');
      }

      // Step 2: Prepare and trigger mailto redirect
      const subject = encodeURIComponent(`Workshop Registration: ${data.workshopTitle}`);
      const body = encodeURIComponent(
        `Workshop: ${data.workshopTitle}\n` +
        `Name: ${data.contactName}\n` +
        `Email: ${data.contactEmail}\n` +
        `Phone: ${data.contactPhone}\n\n` +
        `Notes:\n${data.notes || "None"}`
      );

      // Open mailto client with reliability-focused approach
      const mailtoUrl = `mailto:asktrainersblore@gmail.com?subject=${subject}&body=${body}`;
      
      // Delay redirect slightly for better UX so they see the success message
      setTimeout(() => {
        window.location.assign(mailtoUrl);
      }, 1500);

      setIsSuccess(true);
      toast({
        title: "Registration Recorded!",
        description: "Your details are saved. Redirecting to your email app...",
      });

      setTimeout(() => {
        form.reset();
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-workshop-registration">
        <DialogHeader>
          <DialogTitle data-testid="text-workshop-title">{workshopTitle}</DialogTitle>
          <DialogDescription data-testid="text-workshop-description">
            {workshopDescription}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Registration Successful!</h3>
            <p className="text-muted-foreground">
              We'll contact you shortly with workshop details.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        {...field}
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific requirements or questions..."
                        {...field}
                        data-testid="input-notes"
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
                  className="flex-1"
                  disabled={isSubmitting}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-chart-1 to-chart-1/80"
                  disabled={isSubmitting}
                  data-testid="button-submit"
                >
                  {isSubmitting ? "Processing..." : "Register"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
