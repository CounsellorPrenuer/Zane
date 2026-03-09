import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Star, TrendingUp, Users, Award } from "lucide-react";
import { motion } from "framer-motion";
import PaymentModal from "./PaymentModal";

export default function Hero() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBookSession = () => {
    setIsPaymentModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
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

  const floatingIcons = [
    { icon: Star, position: "top-10 left-10", delay: 0 },
    { icon: TrendingUp, position: "top-20 right-16", delay: 1 },
    { icon: Users, position: "bottom-20 left-16", delay: 2 },
    { icon: Award, position: "bottom-10 right-10", delay: 0.5 }
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-4 lg:pt-12">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-chart-2/10 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_50%)]" />
        
        {/* Floating background elements */}
        {floatingIcons.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={index}
              className={`absolute ${item.position} text-primary/20 hidden lg:block`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.2, 0.5, 0.2], 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                delay: item.delay 
              }}
            >
              <IconComponent className="w-8 h-8 lg:w-12 lg:h-12" />
            </motion.div>
          );
        })}
      </div>
      
      <motion.div 
        className="relative max-w-7xl mx-auto text-center z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-5xl mx-auto">
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight"
            variants={itemVariants}
          >
            <span className="block">Unlock Your</span>
            <span className="gradient-text block animate-pulse-slow">Potential</span>
            <span className="block">with <span className="text-primary">ASK</span></span>
          </motion.h1>
          
          <motion.div 
            className="space-y-4 mb-12"
            variants={itemVariants}
          >
            <p className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground font-light">
              Professional Training & Business Consultancy Excellence
            </p>
            
            <motion.p 
              className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Transform your organization with expert-led behavioural training, face reading mastery, 
              and leadership development. Join 500,000+ individuals and 1000+ corporates who have achieved excellence with ASK.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center mb-20"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-chart-1 to-chart-1/80 hover:from-chart-1/90 hover:to-chart-1/70 text-white px-8 py-4 text-lg lg:text-xl shadow-orange-glow hover:shadow-orange-glow transition-all duration-300"
                onClick={handleBookSession}
                data-testid="button-book-session"
              >
                <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
                Book a Session
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 ml-2" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="glass px-8 py-4 text-lg lg:text-xl hover:bg-primary/10 transition-all duration-300"
                onClick={() => scrollToSection("#services")}
                data-testid="button-explore-services"
              >
                Explore Services
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Enhanced Trust indicators */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            <motion.div 
              className="text-center p-6 rounded-2xl glass hover-elevate transition-all duration-300"
              data-testid="stat-students"
              whileHover={{ y: -5 }}
            >
              <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">500+</div>
              <div className="text-muted-foreground text-sm lg:text-base font-medium">Students Guided</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 rounded-2xl glass hover-elevate transition-all duration-300"
              data-testid="stat-workshops"
              whileHover={{ y: -5 }}
            >
              <div className="text-4xl lg:text-5xl font-bold text-chart-2 mb-2">100+</div>
              <div className="text-muted-foreground text-sm lg:text-base font-medium">Workshops Conducted</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 rounded-2xl glass hover-elevate transition-all duration-300"
              data-testid="stat-success"
              whileHover={{ y: -5 }}
            >
              <div className="text-4xl lg:text-5xl font-bold text-chart-1 mb-2">95%</div>
              <div className="text-muted-foreground text-sm lg:text-base font-medium">Success Rate</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent" />
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentType="consultation"
        title="Career Guidance Consultation"
        amount={2999}
        description="Get personalized career guidance and admission support from our experts"
      />
    </section>
  );
}