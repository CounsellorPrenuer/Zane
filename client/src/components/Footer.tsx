import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LinkedinIcon, Instagram, Twitter, Mail, Phone, MapPin, Heart, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import askLogo from "@assets/logo_1758789332954.jpg";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: LinkedinIcon,
      href: "https://www.linkedin.com/in/zane-cuxton-b105bb7",
      color: "hover:text-blue-600",
      gradient: "hover:from-blue-600/10 hover:to-blue-600/5"
    },
    {
      name: "Instagram", 
      icon: Instagram,
      href: "#", // todo: replace with actual Instagram URL
      color: "hover:text-pink-600",
      gradient: "hover:from-pink-600/10 hover:to-pink-600/5"
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      href: "#", // todo: replace with actual Twitter URL
      color: "hover:text-blue-400",
      gradient: "hover:from-blue-400/10 hover:to-blue-400/5"
    }
  ];

  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Workshops", href: "#workshops" },
    { name: "Contact", href: "#contact" }
  ];

  const services = [
    "Career Guidance",
    "Workshops & Seminars", 
    "Admission Guidance",
    "Holistic Learning Support"
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-muted/80 via-background to-primary/5 border-t border-border/50 overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-1 to-chart-2" />
        <div className="absolute top-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-chart-2/5 rounded-full blur-2xl" />
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src={askLogo} 
                alt="ASK Logo" 
                className="h-12 lg:h-16 w-auto"
                data-testid="img-footer-logo"
              />
            </motion.div>
            <p className="text-muted-foreground text-sm lg:text-base max-w-sm leading-relaxed">
              Unlock your potential with ASK - Your partner in career guidance, 
              admissions support, and professional development.
            </p>
            <div className="flex space-x-2">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.div
                    key={social.name}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`glass ${social.color} ${social.gradient} transition-all duration-300`}
                      onClick={() => window.open(social.href, '_blank', 'noopener,noreferrer')}
                      data-testid={`button-social-${social.name.toLowerCase()}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-foreground text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.button
                    onClick={() => scrollToSection(link.href)}
                    className="text-muted-foreground hover:text-primary transition-all duration-200 text-sm lg:text-base font-medium group"
                    data-testid={`link-footer-${link.name.toLowerCase()}`}
                    whileHover={{ x: 5 }}
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                    </span>
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-foreground text-lg mb-6">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <motion.li 
                  key={service}
                  className="text-muted-foreground text-sm lg:text-base"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {service}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-foreground text-lg mb-6">Contact Info</h3>
            <div className="space-y-4">
              {[
                { icon: Phone, href: "tel:+919844324100", value: "+91 9844324100", testId: "link-footer-phone", color: "text-chart-1" },
                { icon: Mail, href: "mailto:asktrainersblore@gmail.com", value: "asktrainersblore@gmail.com", testId: "link-footer-email", color: "text-primary" },
                { icon: MapPin, href: null, value: "Lingarajapuram, Bangalore – 560 084", testId: "text-footer-location", color: "text-chart-2" }
              ].map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3 p-2 rounded-lg glass hover-elevate transition-all duration-300"
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br from-muted to-muted/50`}>
                      <IconComponent className={`w-4 h-4 ${contact.color}`} />
                    </div>
                    {contact.href ? (
                      <a 
                        href={contact.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm lg:text-base font-medium"
                        data-testid={contact.testId}
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm lg:text-base" data-testid={contact.testId}>
                        {contact.value}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <Separator className="my-8 lg:my-12 opacity-50" />

        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0"
          variants={itemVariants}
        >
          <motion.p 
            className="text-muted-foreground text-sm lg:text-base flex items-center space-x-2"
            data-testid="text-copyright"
            whileInView={{ opacity: [0, 1] }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span>© {currentYear} Academy for Skill and Knowledge (ASK). Made with</span>
            <motion.span
              animate={{ 
                scale: [1, 1.2, 1],
                color: ["#ef4444", "#f97316", "#ef4444"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex"
            >
              <Heart className="w-4 h-4 fill-current" />
            </motion.span>
            <span>All rights reserved.</span>
          </motion.p>
          
          <div className="flex items-center space-x-6">
            <div className="flex space-x-6 text-sm">
              <motion.button 
                className="text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ y: -2 }}
              >
                Privacy Policy
              </motion.button>
              <motion.button 
                className="text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ y: -2 }}
              >
                Terms of Service
              </motion.button>
            </div>
            
            {/* Back to top button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollToTop}
                className="glass hover:bg-primary/10 transition-all duration-300"
                data-testid="button-back-to-top"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Mentoria Partnership */}
        <Separator className="my-8 opacity-50" />
        
        <motion.p 
          className="text-center text-muted-foreground text-sm lg:text-base"
          data-testid="text-mentoria-partnership"
          whileInView={{ opacity: [0, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          In partnership with Mentoria for enhanced career guidance services.
        </motion.p>
      </motion.div>
    </footer>
  );
}