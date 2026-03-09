import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Send, MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Save to Database
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save message');
      }

      // Step 2: Prepare and trigger mailto redirect
      const subject = encodeURIComponent(`New Inquiry from ${formData.name}`);
      const body = encodeURIComponent(
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone || "Not provided"}\n\n` +
        `Message:\n${formData.message}`
      );

      // Open mailto client with a reliability-focused approach
      const mailtoUrl = `mailto:asktrainersblore@gmail.com?subject=${subject}&body=${body}`;

      // Use location.assign for better compatibility than .href in some browsers
      window.location.assign(mailtoUrl);

      toast({
        title: "Inquiry Received!",
        description: "Your details are saved. If your email app didn't open automatically, please click the Email link in the contact info section.",
      });

      setFormData({ name: "", email: "", phone: "", message: "" });
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

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "+91 9844324100",
      href: "tel:+919844324100",
      color: "text-chart-1",
      gradient: "from-chart-1/10 to-chart-1/5"
    },
    {
      icon: Mail,
      label: "Email",
      value: "asktrainersblore@gmail.com",
      href: "mailto:asktrainersblore@gmail.com",
      color: "text-primary",
      gradient: "from-primary/10 to-primary/5"
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Lingarajapuram, Bangalore – 560 084",
      href: null,
      color: "text-chart-2",
      gradient: "from-chart-2/10 to-chart-2/5"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="contact" className="py-16 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-1/5" />
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-chart-2/5 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="text-center mb-16 lg:mb-24" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to start your journey? Contact us today for a free consultation and discover how we can help you achieve your goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Information */}
          <motion.div className="space-y-8" variants={itemVariants}>
            <Card className="glass border-2 hover:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-1 to-chart-2" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl lg:text-2xl flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-4 p-3 rounded-lg glass hover-elevate transition-all duration-300"
                      whileHover={{ x: 5 }}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`p-4 bg-gradient-to-br ${info.gradient} rounded-xl relative overflow-hidden`}>
                        <IconComponent className={`w-5 h-5 ${info.color} relative z-10`} />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">{info.label}</p>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="text-foreground hover:text-primary transition-colors font-semibold text-base lg:text-lg"
                            data-testid={`link-${info.label.toLowerCase()}`}
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-foreground font-semibold text-base lg:text-lg" data-testid={`text-${info.label.toLowerCase()}`}>
                            {info.value}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass border-2 border-chart-1/20 shadow-orange-glow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chart-1 to-chart-1/70" />
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-chart-1/10 rounded-full blur-xl" />

                <CardContent className="text-center p-8 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex p-4 bg-gradient-to-br from-chart-1/20 to-chart-1/5 rounded-full mb-6"
                  >
                    <Sparkles className="w-6 h-6 text-chart-1" />
                  </motion.div>

                  <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4">
                    Free Consultation Available
                  </h3>
                  <p className="text-muted-foreground text-base lg:text-lg mb-6 leading-relaxed">
                    Book a free 30-minute consultation to discuss your career goals and how we can help you achieve them.
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className="bg-gradient-to-r from-chart-1 to-chart-1/80 hover:from-chart-1/90 hover:to-chart-1/70 shadow-orange-glow w-full text-lg"
                      data-testid="button-book-free-consultation"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Book My Free Call
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <Card className="glass border-2 hover:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-2 to-chart-1" />
              <CardHeader className="pb-6">
                <CardTitle className="text-xl lg:text-2xl flex items-center space-x-2">
                  <Send className="w-5 h-5 text-primary" />
                  <span>Send us a Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div
                      className="space-y-2"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <Label htmlFor="name" className="text-sm font-semibold">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                        className="glass border-2 focus:border-primary/50 transition-all duration-300"
                        data-testid="input-contact-name"
                      />
                    </motion.div>
                    <motion.div
                      className="space-y-2"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Your phone number"
                        className="glass border-2 focus:border-primary/50 transition-all duration-300"
                        data-testid="input-phone"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    className="space-y-2"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                      className="glass border-2 focus:border-primary/50 transition-all duration-300"
                      data-testid="input-contact-email"
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <Label htmlFor="message" className="text-sm font-semibold">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="Tell us about your goals and how we can help you..."
                      className="glass border-2 focus:border-primary/50 transition-all duration-300 resize-none"
                      data-testid="textarea-contact-message"
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-glow text-lg py-3"
                      disabled={isSubmitting}
                      data-testid="button-contact-submit"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                        </motion.div>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}