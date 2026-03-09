import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Award, Users, Zap, Quote, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity";

export default function TrustHighlights() {
  const { data: dynamicTestimonials, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const query = `*[_type == "testimonial"] | order(order asc) {
        name,
        role,
        company,
        rating,
        text,
        image,
        "gradient": "from-primary/20 to-primary/5"
      }`;
      return await client.fetch(query);
    }
  });

  const mockTestimonials = [
    {
      name: "Priya Sharma", 
      role: "Software Engineer",
      company: "Tech Solutions Inc.",
      rating: 5,
      text: "The career guidance I received from ASK was invaluable. Zane helped me transition from finance to tech, and I'm now working at my dream company!",
      image: "PS",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      name: "Rajesh Kumar",
      role: "MBA Graduate",
      company: "Business School Alumni",
      rating: 5,
      text: "The admission guidance program helped me secure a spot at a top-tier business school. The personalized approach made all the difference.",
      image: "RK",
      gradient: "from-chart-1/20 to-chart-1/5"
    },
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      company: "Digital Agency",
      rating: 5,
      text: "The workshops were incredibly practical and immediately applicable to my work. Highly recommend for anyone looking to upskill.",
      image: "SJ",
      gradient: "from-chart-2/20 to-chart-2/5"
    }
  ];

  const testimonials = (dynamicTestimonials && dynamicTestimonials.length > 0) ? dynamicTestimonials : mockTestimonials;

  const highlights = [
    {
      icon: Award,
      title: "Trusted Career Partner",
      description: "Recognized expertise in career development and educational consulting",
      color: "text-chart-1",
      gradient: "from-chart-1/10 to-chart-1/5",
      count: "5+ Years"
    },
    {
      icon: Users,
      title: "500+ Success Stories",
      description: "Students and professionals who have achieved their career goals",
      color: "text-chart-2",
      gradient: "from-chart-2/10 to-chart-2/5",
      count: "500+"
    },
    {
      icon: Zap,
      title: "Mentoria Partnership",
      description: "Enhanced learning through collaboration with industry-leading platforms",
      color: "text-primary",
      gradient: "from-primary/10 to-primary/5",
      count: "Premium"
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
    <section className="py-16 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-primary/5" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-chart-1/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-chart-2/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      <motion.div 
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Trust Highlights */}
        <motion.div className="text-center mb-16 lg:mb-24" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            Why Choose <span className="gradient-text">ASK</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Trusted by students and professionals for delivering results that matter
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-20">
          {highlights.map((highlight, index) => {
            const IconComponent = highlight.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="text-center p-6 lg:p-8 glass border-2 hover:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-full"
                  data-testid={`card-highlight-${index}`}
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${highlight.gradient}`} />
                  
                  <CardContent className="pt-6">
                    <motion.div 
                      className={`inline-flex p-6 rounded-full bg-gradient-to-br ${highlight.gradient} mb-6 relative overflow-hidden`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <IconComponent className={`w-8 h-8 lg:w-10 lg:h-10 ${highlight.color} relative z-10`} />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    </motion.div>
                    
                    <motion.div
                      className="mb-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className={`text-2xl lg:text-3xl font-bold ${highlight.color} mb-2`}>
                        {highlight.count}
                      </div>
                      <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
                        {highlight.title}
                      </h3>
                    </motion.div>
                    
                    <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                      {highlight.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Mentoria Partnership */}
        <motion.div variants={itemVariants} className="mb-20">
          <Card className="p-8 lg:p-12 glass border-2 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-1 to-chart-2" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-2xl animate-float" />
            <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-chart-2/5 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
            
            <div className="text-center relative z-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block mb-6"
              >
                <Badge variant="outline" className="glass" data-testid="badge-partnership">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Partnership Highlight
                </Badge>
              </motion.div>
              
              <motion.h3 
                className="text-2xl lg:text-3xl font-bold text-foreground mb-6"
                whileInView={{ scale: [0.8, 1] }}
                transition={{ duration: 0.5 }}
              >
                Enhanced Learning with <span className="gradient-text">Mentoria</span>
              </motion.h3>
              
              <p className="text-muted-foreground text-base lg:text-lg max-w-4xl mx-auto mb-8 leading-relaxed">
                Our collaboration with Mentoria brings you access to cutting-edge career guidance 
                technology, psychometric assessments, and a vast network of industry experts. 
                This partnership ensures you receive the most comprehensive and up-to-date 
                career development support available.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
                {["Psychometric Assessments", "Industry Expert Network", "AI-Powered Insights", "Career Path Mapping"].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge variant="secondary" className="glass">
                      {feature}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Success Stories */}
        <motion.div className="text-center mb-12 lg:mb-16" variants={itemVariants}>
          <h3 className="text-2xl lg:text-4xl font-bold text-foreground mb-6">
            <span className="gradient-text">Success</span> Stories
          </h3>
          <p className="text-muted-foreground text-base lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Hear from students and professionals who have transformed their careers with our guidance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className="p-6 lg:p-8 glass border-2 hover:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-full"
                data-testid={`card-testimonial-${index}`}
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${testimonial.gradient}`} />
                <Quote className="w-8 h-8 text-primary/50 mb-4" />
                
                <CardContent className="pt-0">
                  <motion.div 
                    className="flex items-center space-x-1 mb-6"
                    whileHover={{ scale: 1.05 }}
                  >
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="w-4 h-4 fill-chart-1 text-chart-1" />
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  <p className="text-foreground text-base lg:text-lg mb-8 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center space-x-4 mt-auto">
                    <motion.div 
                      className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center font-bold text-foreground shadow-lg`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {testimonial.image}
                    </motion.div>
                    <div>
                      <p className="font-bold text-foreground text-base lg:text-lg" data-testid={`text-name-${index}`}>
                        {testimonial.name}
                      </p>
                      <p className="text-sm lg:text-base text-muted-foreground" data-testid={`text-role-${index}`}>
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}