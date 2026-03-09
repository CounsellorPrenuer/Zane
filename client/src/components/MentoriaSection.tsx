import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building, GraduationCap, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function MentoriaSection() {
  const stats = [
    {
      icon: Users,
      value: "3,50,000+",
      label: "Students and Professionals Mentored",
      color: "text-blue-500",
      gradient: "from-blue-500/10 to-blue-500/5"
    },
    {
      icon: Building,
      value: "240+",
      label: "Corporate Partners",
      color: "text-purple-500", 
      gradient: "from-purple-500/10 to-purple-500/5"
    },
    {
      icon: GraduationCap,
      value: "350+", 
      label: "Schools and College Partners",
      color: "text-green-500",
      gradient: "from-green-500/10 to-green-500/5"
    },
    {
      icon: Clock,
      value: "1000+",
      label: "Hours of Career Webinars",
      color: "text-red-500",
      gradient: "from-red-500/10 to-red-500/5"
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
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-muted/30 via-background to-primary/5">
      {/* Background Graphics */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-chart-1/5 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <motion.div 
        className="max-w-6xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="text-center mb-12 lg:mb-16" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Powered by <span className="text-primary">Mentoria's</span>
          </h2>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-6">
            Career Discovery Platform
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Every ASK Consulting plan includes lifetime access to <span className="font-semibold text-primary">Mentoria</span>: India's most trusted platform for career discovery, mentorship, and lifelong upskilling.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="text-center p-6 lg:p-8 glass border-2 hover:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-full"
                  data-testid={`card-mentoria-stat-${index}`}
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`} />
                  
                  <CardContent className="pt-6">
                    <motion.div 
                      className={`w-16 h-16 mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconComponent className={`w-8 h-8 ${stat.color}`} />
                    </motion.div>
                    
                    <div className={`text-3xl lg:text-4xl font-bold ${stat.color} mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-sm lg:text-base text-muted-foreground font-medium leading-tight">
                      {stat.label}
                    </div>
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
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-2xl font-bold text-primary">MENTORIA</div>
              <div className="text-sm text-muted-foreground">Career Discovery Platform</div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a 
                href="https://mentoria.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button 
                  variant="outline"
                  className="glass hover:bg-primary/10 transition-all duration-300"
                  data-testid="button-explore-mentoria"
                  asChild
                >
                  <span className="flex items-center">
                    Click to explore Mentoria's comprehensive career platform
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </span>
                </Button>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}