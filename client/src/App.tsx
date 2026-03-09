import { Switch, Route, Redirect, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Workshops from "@/components/Workshops";
import Blogs from "@/components/Blogs";
import TrustHighlights from "@/components/TrustHighlights";
import Contact from "@/components/Contact";
import MentoriaSection from "@/components/MentoriaSection";
import Footer from "@/components/Footer";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminBlogs from "@/pages/AdminBlogs";
import NotFound from "@/pages/not-found";

// Main portfolio page
function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Workshops />
        <Blogs />
        <TrustHighlights />
        <Contact />
        <MentoriaSection />
      </main>
      <Footer />
    </div>
  );
}

function AppRouter() {
  return (
    <Router base="/Zane">
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/admin">
          <Redirect to="/admin/login" />
        </Route>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/bookings" component={AdminDashboard} />
        <Route path="/admin/blogs" component={AdminBlogs} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppRouter />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
