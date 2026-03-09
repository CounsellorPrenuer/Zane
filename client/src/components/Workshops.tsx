import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Clock, ArrowRight, Sparkles, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { MENTORIA_PRICES, formatPrice } from "@shared/pricing";
import { client, urlFor } from "@/lib/sanity";
import MentoriaBookingModal from "./MentoriaBookingModal";
import WorkshopRegistrationModal from "./WorkshopRegistrationModal";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  features?: PricingFeature[];
  description?: string;
  type?: "standard" | "premium";
  paymentButtonId?: string;
  isCustom?: boolean;
  subgroup?: string;
  planId?: string;
  category?: string;
  imageUrl?: string;
}

const DEFAULT_MENTORIA_PRICING: Record<string, { standard: PricingPlan; premium: PricingPlan }> = {
  "8-9": {
    standard: {
      name: "Discover",
      price: "₹5,500",
      type: "standard",
      subgroup: "8-9 Students",
      features: [
        { text: "Psychometric assessment", included: true },
        { text: "1 career counselling session", included: true },
        { text: "Lifetime Knowledge Gateway access", included: true },
        { text: "Live webinar invites", included: true },
      ],
    },
    premium: {
      name: "Discover Plus+",
      price: "₹15,000",
      type: "premium",
      subgroup: "8-9 Students",
      features: [
        { text: "Psychometric assessments", included: true },
        { text: "8 career counselling sessions (1/year)", included: true },
        { text: "Custom reports & study abroad guidance", included: true },
        { text: "CV building", included: true },
      ],
    },
  },
  "10-12": {
    standard: {
      name: "Achieve Online",
      price: "₹10,000",
      type: "standard",
      subgroup: "10-12 Students",
      features: [
        { text: "Psychometric assessment", included: true },
        { text: "1 career counselling session", included: true },
        { text: "Lifetime Knowledge Gateway access", included: true },
        { text: "Pre-recorded webinars", included: true },
      ],
    },
    premium: {
      name: "Achieve Plus+",
      price: "₹25,000",
      type: "premium",
      subgroup: "10-12 Students",
      features: [
        { text: "Psychometric assessment", included: true },
        { text: "4 career counselling sessions", included: true },
        { text: "Custom reports & study abroad guidance", included: true },
        { text: "CV reviews", included: true },
      ],
    },
  },
  "graduates": {
    standard: {
      name: "Ascend Online",
      price: "₹15,000",
      type: "standard",
      subgroup: "Graduates",
      features: [
        { text: "Psychometric assessment", included: true },
        { text: "1 career counselling session", included: true },
        { text: "Lifetime Knowledge Gateway access", included: true },
        { text: "Pre-recorded webinars", included: true },
      ],
    },
    premium: {
      name: "Ascend Plus+",
      price: "₹35,000",
      type: "premium",
      subgroup: "Graduates",
      features: [
        { text: "Psychometric assessment", included: true },
        { text: "3 career counselling sessions", included: true },
        { text: "Certificate/online course info", included: true },
        { text: "CV reviews for jobs", included: true },
      ],
    },
  },
  "professionals": {
    standard: {
      name: "Ascend Online",
      price: "₹25,000",
      type: "standard",
      subgroup: "Working Professionals",
      features: [
        { text: "Psychometric assessment", included: true },
        { text: "1 career counselling session", included: true },
        { text: "Lifetime Knowledge Gateway access", included: true },
        { text: "Pre-recorded webinars", included: true },
      ],
    },
    premium: {
      name: "Ascend Plus+",
      price: "₹50,000",
      type: "premium",
      subgroup: "Working Professionals",
      features: [
        { text: "Psychometric assessment", included: true },
        { text: "3 career counselling sessions", included: true },
        { text: "Certificate/online course info", included: true },
        { text: "CV reviews for jobs", included: true },
      ],
    },
  },
};

const DEFAULT_CUSTOM_PACKAGES: PricingPlan[] = [
  { planId: "career-report", name: "Career Report", price: "₹1,500", description: "Get a detailed report of your psychometric assessment for a scientific analysis of your interests." },
  { planId: "career-report-counselling", name: "Career Report + Career Counselling", price: "₹5,000", description: "Connect with India's top career coaches to analyse your psychometric report." },
  { planId: "knowledge-gateway", name: "Knowledge Gateway + Career Helpline Access", price: "₹1,500", description: "Unlock holistic information on your career paths and get direct access to Mentoria's experts." },
  { planId: "one-to-one-session", name: "One-to-One Session with a Career Expert", price: "₹3,500", description: "Resolve your career queries through a one-on-one session with an expert." },
  { planId: "college-admission-planning", name: "College Admission Planning", price: "₹35,000", description: "Get unbiased recommendations and details on your future college options." },
  { planId: "exam-stress-management", name: "Exam Stress Management", price: "₹2,500", description: "Get expert guidance on tackling exam stress, planning your study schedule." },
  { planId: "cap-100", name: "College Admissions Planner - 100 (CAP-100)", price: "₹1,00,000", description: "₹1,00,000 for a ranked list of the top 100 colleges in your course." }
];

const DEFAULT_WORKSHOPS = [
  {
    title: "Communication & Presentation Skills",
    description: "Develop proficiency in dialogue, persuasion, and conducting fruitful meetings. Master the art of effective communication and control emotions.",
    date: "Contact for Schedule",
    location: "Bangalore / On-site",
    duration: "2 Days (12 hrs)",
    participants: "25",
    type: "Behavioural Skills",
    price: "Contact for Pricing",
    status: "Open",
    gradient: "from-primary/10 to-primary/5"
  },
  {
    title: "Team Building & Leadership",
    description: "Learn to develop and sustain productive teams. Master leadership styles, team objectives, and manage team dynamics effectively.",
    date: "Contact for Schedule",
    location: "Bangalore / On-site",
    duration: "2 Days (12 hrs)",
    participants: "30",
    type: "Leadership Development",
    price: "Contact for Pricing",
    status: "Open",
    gradient: "from-chart-2/10 to-chart-2/5"
  },
  {
    title: "Selling Skills & Sales Closing Techniques",
    description: "Develop result-oriented sales processes. Master customer research, need development, objection handling, and multiple closing techniques.",
    date: "Contact for Schedule",
    location: "Bangalore / On-site",
    duration: "2 Days (12 hrs)",
    participants: "20",
    type: "Sales Excellence",
    price: "Contact for Pricing",
    status: "Open",
    gradient: "from-chart-1/10 to-chart-1/5"
  },
  {
    title: "Customer Service Excellence",
    description: "Master customer service as a powerful factor of corporate success. Learn performance standards, listening skills, and effective customer communication.",
    date: "Contact for Schedule",
    location: "Bangalore / On-site",
    duration: "2 Days (12 hrs)",
    participants: "25",
    type: "Customer Service",
    price: "Contact for Pricing",
    status: "Open",
    gradient: "from-primary/10 to-primary/5"
  },
  {
    title: "Assertiveness & The Winning Attitudes",
    description: "Improve self-esteem, handle criticism diplomatically, and develop winning mindsets. Discover your skills and talents for enhanced confidence.",
    date: "Contact for Schedule",
    location: "Bangalore / On-site",
    duration: "2 Days (12 hrs)",
    participants: "30",
    type: "Personal Development",
    price: "Contact for Pricing",
    status: "Open",
    gradient: "from-chart-2/10 to-chart-2/5"
  },
  {
    title: "Negotiation Skills & Techniques",
    description: "Handle price pressure effectively with higher-level negotiation competence. Master the core process, behavioral ploys, and tactics of negotiation.",
    date: "Contact for Schedule",
    location: "Bangalore / On-site",
    duration: "2 Days (12 hrs)",
    participants: "20",
    type: "Professional Skills",
    price: "Contact for Pricing",
    status: "Open",
    gradient: "from-chart-1/10 to-chart-1/5"
  }
];

function MentoriaPricingCard({
  plan,
  onBuyNow,
  onInquire
}: {
  plan: PricingPlan;
  onBuyNow?: (plan: PricingPlan) => void;
  onInquire?: () => void;
}) {
  return (
    <Card className="flex flex-col h-full glass border-2 hover:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${plan.isCustom ? "from-chart-1 to-chart-1/70" : "from-primary via-chart-1 to-chart-2"}`} />

      {plan.isCustom && (
        <div className="h-48 overflow-hidden relative">
          <img 
            src={plan.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"} 
            alt={plan.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      <CardHeader className="space-y-4 p-6">
        <div className="space-y-2">
          {!plan.isCustom && (
            <Badge variant={plan.type === "premium" ? "default" : "secondary"} className="mb-2">
              {plan.type?.toUpperCase()}
            </Badge>
          )}
          <h3 className="text-xl lg:text-2xl font-bold leading-tight">{plan.name}</h3>
          <p className="text-3xl font-bold gradient-text">{plan.price}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6 pt-0 flex flex-col">
        {plan.description && (
          <p className="text-muted-foreground text-sm mb-6 flex-1 italic leading-relaxed">
            {plan.description}
          </p>
        )}

        {plan.features && plan.features.length > 0 && (
          <ul className="space-y-3 mb-6 flex-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm lg:text-base text-foreground leading-snug">
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4 flex justify-center">
          <Button
            className="w-full bg-gradient-to-r from-chart-1 to-chart-1/80 shadow-orange-glow text-white font-bold h-12"
            onClick={() => onBuyNow ? onBuyNow(plan) : (onInquire ? onInquire() : null)}
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Workshops() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<number | null>(null);
  const [selectedMentoriaPlan, setSelectedMentoriaPlan] = useState<PricingPlan | null>(null);
  const [programType, setProgramType] = useState<"ask" | "mentoria">("mentoria");
  const [selectedCategory, setSelectedCategory] = useState<string>("8-9");
  const [workshops, setWorkshops] = useState(DEFAULT_WORKSHOPS);
  const [mentoriaPricing, setMentoriaPricing] = useState(DEFAULT_MENTORIA_PRICING);
  const [customPackages, setCustomPackages] = useState<PricingPlan[]>(DEFAULT_CUSTOM_PACKAGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sanityWorkshops, sanityPlans] = await Promise.all([
          client.fetch(`*[_type == "workshop"]`),
          client.fetch(`*[_type == "mentoriaPlan"]`)
        ]);

        if (sanityWorkshops && sanityWorkshops.length > 0) {
          setWorkshops(sanityWorkshops.map((w: any, i: number) => ({
            ...w,
            gradient: w.gradient || (i % 3 === 0 ? "from-primary/10 to-primary/5" : i % 3 === 1 ? "from-chart-2/10 to-chart-2/5" : "from-chart-1/10 to-chart-1/5")
          })));
        }

        if (sanityPlans && sanityPlans.length > 0) {
          // Create a deep copy of the default pricing to avoid mutations
          const transformedPricing: any = JSON.parse(JSON.stringify(DEFAULT_MENTORIA_PRICING));
          const transformedCustom: PricingPlan[] = [];

          sanityPlans.forEach((plan: any) => {
            if (plan.isCustom) {
              transformedCustom.push({
                planId: plan.planId,
                name: plan.name,
                price: formatPrice(plan.price),
                description: plan.description,
                paymentButtonId: plan.paymentButtonId,
                isCustom: true,
                imageUrl: plan.image ? urlFor(plan.image).url() : undefined
              });
            } else {
              const category = plan.category || "8-9";
              if (!transformedPricing[category]) {
                transformedPricing[category] = { standard: null, premium: null };
              }
              transformedPricing[category][plan.tier || "standard"] = {
                name: plan.name,
                price: formatPrice(plan.price),
                type: plan.tier,
                subgroup: plan.subgroup,
                paymentButtonId: plan.paymentButtonId,
                features: (plan.features || []).map((f: string) => ({ text: f, included: true })),
                isCustom: false,
                imageUrl: plan.image ? urlFor(plan.image).url() : undefined
              };
            }
          });

          setMentoriaPricing(transformedPricing);
          if (transformedCustom.length > 0) {
            setCustomPackages(transformedCustom);
          }
        } else {
          // If no plans found in Sanity, ensure we're using defaults
          setMentoriaPricing(DEFAULT_MENTORIA_PRICING);
          setCustomPackages(DEFAULT_CUSTOM_PACKAGES);
        }
      } catch (error) {
        console.error("Error fetching data from Sanity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWorkshopRegister = (workshopIndex: number) => {
    setSelectedWorkshop(workshopIndex);
  };

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
    <section id="workshops" className="py-16 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-chart-1/5" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-chart-2/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Programs</span> & Pricing
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Choose the program that best fits your career development journey
          </p>
        </motion.div>

        {/* Program Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-muted rounded-lg">
            <button
              onClick={() => setProgramType("ask")}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${programType === "ask"
                ? "bg-background shadow-sm"
                : "hover-elevate"
                }`}
              data-testid="tab-ask-programs"
            >
              ASK Individual Programs
            </button>
            <button
              onClick={() => setProgramType("mentoria")}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${programType === "mentoria"
                ? "bg-background shadow-sm"
                : "hover-elevate"
                }`}
              data-testid="tab-mentoria-programs"
            >
              Mentoria Partnership Programs
            </button>
          </div>
        </div>

        {/* ASK Individual Programs (Workshops) */}
        {programType === "ask" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12 mb-16">
              {workshops.map((workshop, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`flex flex-col h-full glass border-2 hover:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden`}
                    data-testid={`card-workshop-${index}`}
                  >
                    {/* Gradient overlay */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${workshop.gradient}`} />

                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge
                            variant={workshop.status === "Filling Fast" ? "destructive" : "secondary"}
                            className={workshop.status === "Filling Fast" ? "animate-pulse" : ""}
                            data-testid={`badge-status-${index}`}
                          >
                            {workshop.status === "Filling Fast" && <Sparkles className="w-3 h-3 mr-1" />}
                            {workshop.status}
                          </Badge>
                        </motion.div>
                        <Badge variant="outline" className="glass" data-testid={`badge-type-${index}`}>
                          {workshop.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl lg:text-2xl mb-3 leading-tight">{workshop.title}</CardTitle>
                      <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">{workshop.description}</p>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <div className="grid grid-cols-2 gap-3 mb-8">
                        <motion.div
                          className="flex items-center space-x-2 text-sm p-2 rounded-lg glass"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="truncate" data-testid={`text-date-${index}`}>{workshop.date}</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center space-x-2 text-sm p-2 rounded-lg glass"
                          whileHover={{ scale: 1.05 }}
                        >
                          <MapPin className="w-4 h-4 text-chart-2 flex-shrink-0" />
                          <span className="truncate" data-testid={`text-location-${index}`}>{workshop.location}</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center space-x-2 text-sm p-2 rounded-lg glass"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Clock className="w-4 h-4 text-chart-1 flex-shrink-0" />
                          <span data-testid={`text-duration-${index}`}>{workshop.duration}</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center space-x-2 text-sm p-2 rounded-lg glass"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate" data-testid={`text-participants-${index}`}>Max {workshop.participants}</span>
                        </motion.div>
                      </div>

                      <div className="mt-auto">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            className="w-full bg-gradient-to-r from-chart-1 to-chart-1/80 shadow-orange-glow text-white"
                            onClick={() => handleWorkshopRegister(index)}
                            data-testid={`button-register-${index}`}
                          >
                            <span>Register Now</span>
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Custom Workshops */}
            <motion.div variants={itemVariants}>
              <Card className="p-8 lg:p-12 glass border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-1 to-chart-2" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
                <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-chart-2/5 rounded-full blur-2xl" />

                <div className="text-center relative z-10">
                  <motion.h3
                    className="text-2xl lg:text-3xl font-bold text-foreground mb-6"
                    whileInView={{ scale: [0.8, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    Custom Workshops for Organizations
                  </motion.h3>
                  <p className="text-muted-foreground text-base lg:text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
                    We design customized workshops and seminars tailored specifically for schools,
                    colleges, and corporate teams. Our programs can be delivered on-site or virtually
                    to meet your organization's unique needs.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="glass border-primary text-primary"
                        onClick={scrollToContact}
                        data-testid="button-custom-workshop-inquiry"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Request Custom Workshop
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="bg-gradient-to-r from-chart-2 to-chart-2/80 shadow-green-glow"
                        onClick={scrollToContact}
                        data-testid="button-corporate-training"
                      >
                        Corporate Training Solutions
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}

        {/* Mentoria Partnership Programs */}
        {programType === "mentoria" && (
          <div className="space-y-24">
            {/* Standard Packages Section */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="text-center space-y-4">
                <h3 className="text-2xl lg:text-4xl font-bold">Standard Mentoria Packages 🎓</h3>
                <p className="text-muted-foreground text-lg">These are the main comprehensive packages.</p>
              </div>

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0">
                  <TabsTrigger
                    value="8-9"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 border-2 border-transparent data-[state=active]:border-primary/20"
                    data-testid="tab-8-9-students"
                  >
                    8-9 Students
                  </TabsTrigger>
                  <TabsTrigger
                    value="10-12"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 border-2 border-transparent data-[state=active]:border-primary/20"
                    data-testid="tab-10-12-students"
                  >
                    10-12 Students
                  </TabsTrigger>
                  <TabsTrigger
                    value="graduates"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 border-2 border-transparent data-[state=active]:border-primary/20"
                    data-testid="tab-graduates"
                  >
                    College Graduates
                  </TabsTrigger>
                  <TabsTrigger
                    value="professionals"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 border-2 border-transparent data-[state=active]:border-primary/20"
                    data-testid="tab-professionals"
                  >
                    Working Professionals
                  </TabsTrigger>
                </TabsList>

                {Object.entries(mentoriaPricing).map(([category, plans]) => (
                  <TabsContent key={category} value={category} className="mt-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {plans.standard && (
                        <MentoriaPricingCard
                          plan={plans.standard}
                          onBuyNow={(p) => setSelectedMentoriaPlan({ ...p, category: category })}
                          onInquire={scrollToContact}
                        />
                      )}
                      {plans.premium && (
                        <MentoriaPricingCard
                          plan={plans.premium}
                          onBuyNow={(p) => setSelectedMentoriaPlan({ ...p, category: category })}
                          onInquire={scrollToContact}
                        />
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>

            {/* Custom Packages Section */}
            <motion.div variants={itemVariants} className="space-y-12">
              <div className="text-center space-y-4">
                <h3 className="text-2xl lg:text-4xl font-bold">Want To Customise Your Mentorship Plan?</h3>
                <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                  If you want to subscribe to specific services from Mentoria that resolve your career challenges, you can choose one or more of the following:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {customPackages.map((pkg, idx) => (
                  <motion.div
                    key={pkg.planId || idx}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MentoriaPricingCard
                      plan={pkg}
                      onBuyNow={(p) => setSelectedMentoriaPlan({ ...p, category: "custom" })}
                      onInquire={scrollToContact}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Workshop Registration Modal */}
      {selectedWorkshop !== null && (
        <WorkshopRegistrationModal
          isOpen={selectedWorkshop !== null}
          onClose={() => setSelectedWorkshop(null)}
          workshopTitle={workshops[selectedWorkshop].title}
          workshopDescription={workshops[selectedWorkshop].description}
        />
      )}
      {/* Mentoria Booking Modal */}
      {selectedMentoriaPlan && (
        <MentoriaBookingModal
          isOpen={selectedMentoriaPlan !== null}
          onClose={() => setSelectedMentoriaPlan(null)}
          plan={{
            category: selectedMentoriaPlan.category || "8-9",
            tier: selectedMentoriaPlan.type || "standard",
            programName: selectedMentoriaPlan.name,
            price: parseInt(selectedMentoriaPlan.price.replace(/[^\d]/g, "")),
            subgroup: selectedMentoriaPlan.subgroup || selectedMentoriaPlan.name,
          }}
        />
      )}
    </section>
  );
}
