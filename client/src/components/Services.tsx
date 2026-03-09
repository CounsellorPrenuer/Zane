import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Users, GraduationCap, Target, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Services() {
  const services = [
    {
      icon: Users,
      title: "Behavioural & Communication Skills",
      description: "Master the art of effective communication, assertiveness, and interpersonal excellence through interactive training programs.",
      features: ["Communication & Presentation Skills", "Body Language Mastery", "Assertiveness Training", "Dealing with Problem Behaviour"],
      color: "text-primary",
      gradient: "from-primary/10 to-primary/5",
      shadow: "shadow-glow"
    },
    {
      icon: Target,
      title: "Leadership & Team Development", 
      description: "Develop essential leadership qualities and build high-performing teams with proven strategies and practical insights.",
      features: ["Leadership Skills", "Team Building", "Motivation & Winning Attitudes", "Performance Management"],
      color: "text-chart-2",
      gradient: "from-chart-2/10 to-chart-2/5",
      shadow: "shadow-green-glow"
    },
    {
      icon: GraduationCap,
      title: "Sales & Customer Service Excellence",
      description: "Transform your sales team with advanced selling techniques, negotiation skills, and customer service mastery.",
      features: ["Selling Skills & Sales Closing", "Negotiation Techniques", "Customer Service Excellence", "Telephone & Telemarketing Skills"],
      color: "text-chart-1",
      gradient: "from-chart-1/10 to-chart-1/5",
      shadow: "shadow-orange-glow"
    },
    {
      icon: Compass,
      title: "In-House Corporate Training",
      description: "Customized training solutions designed to meet your organization's specific needs, culture, and business objectives.",
      features: ["Tailored Programs", "Cost-Effective Solutions", "Outbound Training", "Train-the-Trainer Workshops"],
      color: "text-primary",
      gradient: "from-primary/10 to-primary/5",
      shadow: "shadow-glow"
    }
  ];

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

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
    <section id="services" className="py-16 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-1 to-chart-2" />
        <div className="absolute top-40 left-20 w-20 h-20 bg-primary/5 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-40 right-20 w-32 h-32 bg-chart-1/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-chart-2/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <motion.div 
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="text-center mb-16 lg:mb-24" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            High-quality professional training and business consultancy services to enhance individual and organizational performance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`group hover-elevate transition-all duration-500 glass border-2 hover:border-primary/20 ${service.shadow} h-full`}
                  data-testid={`card-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardHeader className="pb-4">
                    <motion.div 
                      className="flex items-center space-x-4 mb-6"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.gradient} ${service.color} relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-7 h-7 lg:w-8 lg:h-8 relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardTitle className="text-xl lg:text-2xl font-bold">{service.title}</CardTitle>
                    </motion.div>
                    <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">{service.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          className="flex items-center space-x-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                        >
                          <CheckCircle className="w-4 h-4 text-chart-2 flex-shrink-0" />
                          <span className="text-foreground font-medium">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full glass group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                        onClick={scrollToContact}
                        data-testid={`button-learn-more-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-chart-1 to-chart-1/80 hover:from-chart-1/90 hover:to-chart-1/70 px-12 py-4 text-lg lg:text-xl shadow-orange-glow hover:shadow-orange-glow transition-all duration-300"
              onClick={scrollToContact}
              data-testid="button-get-started"
            >
              <span>Get Started Today</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
          
          <p className="text-muted-foreground mt-4 text-sm lg:text-base">
            Ready to elevate your skills? Let's begin your transformation journey together.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}