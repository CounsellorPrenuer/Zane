import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import askLogo from "@assets/logo_1758789332954.jpg";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navigation = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Workshops", href: "#workshops" },
    { name: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detect which section is currently in view
      const sections = navigation.map(nav => nav.href.substring(1));
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-lg shadow-lg border-b border-border/50" 
          : "bg-background/80 backdrop-blur-md"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img 
              src={askLogo} 
              alt="Academy for Skill and Knowledge (ASK)" 
              className={`w-auto transition-all duration-300 ${
                isScrolled ? "h-8 lg:h-10" : "h-10 lg:h-12"
              }`}
              data-testid="img-logo"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2 lg:space-x-8">
            {navigation.map((item, index) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className={`relative px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 group ${
                    isActive ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                  data-testid={`link-nav-${item.name.toLowerCase()}`}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.name}
                  <span className={`absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-transform duration-300 ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </motion.button>
              );
            })}
          </nav>

          {/* CTA and Mobile Menu */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <ThemeToggle />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:block"
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="glass hover:bg-primary/10 transition-all duration-300"
                onClick={() => scrollToSection("#contact")}
                data-testid="button-book-call"
              >
                <Phone className="w-4 h-4" />
                <span className="ml-2 hidden lg:inline">Book Free Call</span>
                <span className="ml-2 lg:hidden">Book Call</span>
              </Button>
            </motion.div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border/20">
                {navigation.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className="block px-3 py-3 text-foreground hover:text-primary hover:bg-accent w-full text-left transition-all duration-200 rounded-lg"
                    data-testid={`link-mobile-${item.name.toLowerCase()}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.name}
                  </motion.button>
                ))}
                <motion.div 
                  className="px-3 py-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full glass"
                    onClick={() => scrollToSection("#contact")}
                    data-testid="button-mobile-book-call"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Book Free Call
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}