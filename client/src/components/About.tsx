import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkedinIcon, ExternalLink, Quote, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import profilePhoto from "@assets/profile-photo_1758789332956.jpg";

export default function About() {
  const achievements = [
    "500,000+ Individuals Trained Globally",
    "5000+ Workshops & Seminars Conducted", 
    "1000+ Corporate Clients Served",
    "1200+ Education Institutions Partnered"
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
    <section id="about" className="py-16 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-primary/5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-chart-2/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-chart-1/10 rounded-full blur-3xl" />
      
      <motion.div 
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="text-center mb-16 lg:mb-24" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            Meet the <span className="gradient-text">Founder</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A globally recognized behavioural trainer, transformational mentor, and pioneering face reading expert with over four decades of experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Profile Photo */}
          <motion.div 
            className="flex justify-center lg:justify-start order-2 lg:order-1"
            variants={itemVariants}
          >
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-chart-1/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300" />
              <div className="relative">
                <img
                  src={profilePhoto}
                  alt="Zane E. Cuxton - Founder of Academy for Skill and Knowledge"
                  className="w-80 h-80 lg:w-96 lg:h-96 rounded-3xl object-cover shadow-2xl relative z-10"
                  data-testid="img-founder-photo"
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
              </div>
            </motion.div>
          </motion.div>

          {/* About Content */}
          <motion.div className="space-y-8 order-1 lg:order-2" variants={itemVariants}>
            <div>
              <motion.h3 
                className="text-3xl lg:text-4xl font-bold text-foreground mb-3"
                whileInView={{ scale: [0.8, 1] }}
                transition={{ duration: 0.5 }}
              >
                Zane E. Cuxton
              </motion.h3>
              <p className="text-lg lg:text-xl text-primary font-semibold mb-6">
                Behavioural Trainer | Body Language & Face Reading Expert | Founder – ASK & FRFW
              </p>
              
              <div className="space-y-4 text-foreground text-base lg:text-lg leading-relaxed">
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Originally trained in the pharmaceutical industry, Zane began his professional journey 
                  in sales and marketing, serving as Vice President – Marketing for 12 years. An ISO-certified 
                  trainer and postgraduate in Sales, he founded the Academy for Skill and Knowledge (ASK) in 
                  1995 as "The Anvil to Shape Careers."
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  In 2000, Zane established the Face Readers Foundation of the World (FRFW), pioneering the 
                  integration of face reading, body language analysis, and micro-expression techniques into 
                  professional development. He specializes in behavioural skills, emotional intelligence, 
                  leadership development, and human dynamics.
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  His work has been featured on BBC, Discovery, STAR Network, Times of India, and numerous 
                  other media outlets. Zane has worked with elite institutions including IITs, IIMs, NACEN, 
                  and the Tamil Nadu Police Department, transforming lives through his intuitive insights 
                  and practical training programs.
                </motion.p>
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <CheckCircle className="w-5 h-5 text-chart-2 flex-shrink-0" />
                  <span className="text-foreground font-medium">{achievement}</span>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  className="glass hover:bg-primary/10 transition-all duration-300"
                  onClick={() => window.open('https://www.linkedin.com/in/zane-cuxton-b105bb7', '_blank')}
                  data-testid="button-linkedin-profile"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span className="mx-2">LinkedIn Profile</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  className="bg-gradient-to-r from-chart-1 to-chart-1/80 hover:from-chart-1/90 hover:to-chart-1/70 shadow-orange-glow"
                  onClick={() => {
                    const element = document.querySelector("#contact");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }}
                  data-testid="button-schedule-consultation"
                >
                  Schedule Consultation
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Vision Statement */}
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <Card className="p-8 lg:p-12 max-w-5xl mx-auto glass border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-1 to-chart-2" />
            
            <Quote className="w-8 h-8 lg:w-12 lg:h-12 text-primary mx-auto mb-6 opacity-50" />
            
            <h4 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">Our Vision</h4>
            <p className="text-lg lg:text-xl text-muted-foreground italic leading-relaxed max-w-3xl mx-auto">
              "To unlock human potential by integrating the science of face reading, body language, 
              and emotional intelligence with modern leadership development—empowering individuals and 
              organizations to decode human behaviour, build authentic connections, and achieve 
              transformational success."
            </p>
            
            <div className="mt-8">
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-chart-1 mx-auto rounded-full" />
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  );
}