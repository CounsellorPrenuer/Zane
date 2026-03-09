import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LogOut, 
  Shield, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  Trash2,
  UserCheck,
  CreditCard,
  TrendingUp,
  Download,
  DollarSign,
  BookOpen,
  MessageSquare,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from 'xlsx';
import type { Consultation, WorkshopRegistration, Payment, ContactMessage, MentoriaBooking } from "@shared/schema";

interface AdminStats {
  totalBookings: number;
  totalConsultations: number;
  totalWorkshopRegistrations: number;
  totalMentoriaBookings: number;
  totalPayments: number;
  totalRevenue: number;
  recentBookings: (Consultation | WorkshopRegistration | MentoriaBooking)[];
  recentPayments: Payment[];
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check admin authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/status");
        setIsAuthenticated(response.ok);
        if (!response.ok) {
          navigate("/admin/login");
        }
      } catch (error) {
        setIsAuthenticated(false);
        navigate("/admin/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch admin statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated === true,
  });

  // Fetch consultations
  const {
    data: consultations = [],
    isLoading: consultationsLoading,
    error: consultationsError,
  } = useQuery<Consultation[]>({
    queryKey: ["/api/admin/consultations"],
    enabled: isAuthenticated === true,
  });

  // Fetch workshop registrations
  const {
    data: registrations = [],
    isLoading: registrationsLoading,
    error: registrationsError,
  } = useQuery<WorkshopRegistration[]>({
    queryKey: ["/api/admin/workshop-registrations"],
    enabled: isAuthenticated === true,
  });

  // Fetch payments
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
    enabled: isAuthenticated === true,
  });

  // Fetch contact messages
  const {
    data: contactMessages = [],
    isLoading: contactMessagesLoading,
    error: contactMessagesError,
  } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/contact-messages"],
    enabled: isAuthenticated === true,
  });

  // Fetch Mentoria bookings
  const {
    data: mentoriaBookings = [],
    isLoading: mentoriaBookingsLoading,
    error: mentoriaBookingsError,
  } = useQuery<MentoriaBooking[]>({
    queryKey: ["/api/admin/mentoria-bookings"],
    enabled: isAuthenticated === true,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      navigate("/admin/login");
    },
  });

  // Delete consultation mutation
  const deleteConsultationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/consultations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete consultation");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/payments/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteConsultation = (id: string) => {
    if (confirm("Are you sure you want to delete this consultation?")) {
      deleteConsultationMutation.mutate(id);
    }
  };

  const handleUpdatePaymentStatus = (id: string, status: string) => {
    updatePaymentStatusMutation.mutate({ id, status });
  };

  // Update contact message status mutation
  const updateContactMessageStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/contact-messages/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update contact message status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  // Delete contact message mutation
  const deleteContactMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete contact message");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  const handleUpdateContactMessageStatus = (id: string, status: string) => {
    updateContactMessageStatusMutation.mutate({ id, status });
  };

  const handleDeleteContactMessage = (id: string) => {
    if (confirm("Are you sure you want to delete this contact message?")) {
      deleteContactMessageMutation.mutate(id);
    }
  };

  const exportData = async (type: 'all' | 'consultations' | 'registrations' | 'payments' | 'contact-messages' | 'bookings' | 'lead-downloads') => {
    try {
      let data;
      let filename;
      let wb: XLSX.WorkBook;
      
      switch (type) {
        case 'consultations':
          data = consultations;
          filename = 'consultations.xlsx';
          wb = XLSX.utils.book_new();
          const consultationsSheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, consultationsSheet, "Consultations");
          break;
        case 'registrations':
          data = registrations;
          filename = 'workshop_registrations.xlsx';
          wb = XLSX.utils.book_new();
          const registrationsSheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, registrationsSheet, "Registrations");
          break;
        case 'payments':
          data = payments;
          filename = 'payments.xlsx';
          wb = XLSX.utils.book_new();
          const paymentsSheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, paymentsSheet, "Payments");
          break;
        case 'contact-messages':
          data = contactMessages;
          filename = 'contact_messages.xlsx';
          wb = XLSX.utils.book_new();
          const contactMessagesSheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, contactMessagesSheet, "Contact Messages");
          break;
        case 'bookings':
          data = [...consultations, ...registrations, ...mentoriaBookings];
          filename = 'all_bookings.xlsx';
          wb = XLSX.utils.book_new();
          const bookingsSheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, bookingsSheet, "All Bookings");
          break;
        case 'lead-downloads':
          data = []; // No lead downloads data yet
          filename = 'lead_downloads.xlsx';
          wb = XLSX.utils.book_new();
          const leadDownloadsSheet = XLSX.utils.json_to_sheet([{ message: 'No lead downloads available yet' }]);
          XLSX.utils.book_append_sheet(wb, leadDownloadsSheet, "Lead Downloads");
          break;
        default:
          filename = 'admin_data_export.xlsx';
          wb = XLSX.utils.book_new();
          // Create separate sheets for each data type
          if (consultations && consultations.length > 0) {
            const consultationsSheet = XLSX.utils.json_to_sheet(consultations);
            XLSX.utils.book_append_sheet(wb, consultationsSheet, "Consultations");
          }
          if (registrations && registrations.length > 0) {
            const registrationsSheet = XLSX.utils.json_to_sheet(registrations);
            XLSX.utils.book_append_sheet(wb, registrationsSheet, "Registrations");
          }
          if (payments && payments.length > 0) {
            const paymentsSheet = XLSX.utils.json_to_sheet(payments);
            XLSX.utils.book_append_sheet(wb, paymentsSheet, "Payments");
          }
          if (contactMessages && contactMessages.length > 0) {
            const contactMessagesSheet = XLSX.utils.json_to_sheet(contactMessages);
            XLSX.utils.book_append_sheet(wb, contactMessagesSheet, "Contact Messages");
          }
          if (stats) {
            const statsSheet = XLSX.utils.json_to_sheet([stats]);
            XLSX.utils.book_append_sheet(wb, statsSheet, "Statistics");
          }
      }

      // Create the Excel file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline"><RefreshCw className="w-3 h-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Checking authentication...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // Will redirect to login
  }

  const isLoading = statsLoading || consultationsLoading || registrationsLoading || paymentsLoading || contactMessagesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Academy for Skill and Knowledge</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/blogs")}
                data-testid="button-manage-blogs"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Blogs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('all')}
                data-testid="button-export-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="contact-forms" data-testid="tab-contact-forms">Contact Forms</TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">Payments</TabsTrigger>
            <TabsTrigger value="lead-downloads" data-testid="tab-lead-downloads">Lead Downloads</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {/* Total Bookings */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                        <p className="text-2xl font-bold" data-testid="stat-total-bookings">
                          {statsLoading ? "..." : (stats?.totalBookings || 0)}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                {/* Pending */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600" data-testid="stat-pending">
                          {statsLoading ? "..." : (
                            consultations.filter(c => c.status === 'pending').length + 
                            registrations.filter(r => r.status === 'pending').length +
                            payments.filter(p => p.status === 'pending').length
                          )}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Contacted */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contacted</p>
                        <p className="text-2xl font-bold text-blue-600" data-testid="stat-contacted">
                          {statsLoading ? "..." : (
                            consultations.filter(c => c.status === 'confirmed').length + 
                            registrations.filter(r => r.status === 'confirmed').length
                          )}
                        </p>
                      </div>
                      <Phone className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Completed */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-green-600" data-testid="stat-completed">
                          {statsLoading ? "..." : (
                            consultations.filter(c => c.status === 'completed').length
                          )}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Forms */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contact Forms</p>
                        <p className="text-2xl font-bold text-purple-600" data-testid="stat-contact-forms">
                          {contactMessagesLoading ? "..." : contactMessages.length}
                        </p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Lead Downloads */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Lead Downloads</p>
                        <p className="text-2xl font-bold text-orange-600" data-testid="stat-lead-downloads">0</p>
                      </div>
                      <Download className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Total Payments */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                        <p className="text-2xl font-bold text-blue-600" data-testid="stat-total-payments">
                          {paymentsLoading ? "..." : payments.length}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold text-green-600" data-testid="stat-revenue">
                          {statsLoading ? "..." : `₹${stats?.totalRevenue || 0}`}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Investments Card (separate row) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Investments</p>
                        <p className="text-2xl font-bold text-orange-600" data-testid="stat-investments">0</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Bookings</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportData('bookings')}
                      data-testid="button-export-bookings"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {consultations.length === 0 && registrations.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">Consultation and workshop bookings will appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {[...consultations, ...registrations]
                          .sort((a, b) => {
                            const aDate = 'createdAt' in a ? a.createdAt : a.registrationDate;
                            const bDate = 'createdAt' in b ? b.createdAt : b.registrationDate;
                            return new Date(bDate).getTime() - new Date(aDate).getTime();
                          })
                          .slice(0, 5)
                          .map((booking, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <p className="font-medium">{booking.contactName}</p>
                                <p className="text-sm text-muted-foreground">{booking.contactEmail}</p>
                              </div>
                              <Badge 
                                variant={
                                  booking.status === 'completed' ? 'default' :
                                  booking.status === 'confirmed' ? 'secondary' :
                                  'outline'
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Contact Forms */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Contact Forms</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportData('contact-messages')}
                      data-testid="button-export-contact-forms"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {contactMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No contact forms yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">Contact form submissions will appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {contactMessages.slice(0, 5).map((message) => (
                          <div key={message.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{message.name}</p>
                              <p className="text-sm text-muted-foreground">{message.email}</p>
                            </div>
                            <Badge 
                              variant={
                                message.status === 'replied' ? 'default' :
                                message.status === 'read' ? 'secondary' :
                                'outline'
                              }
                            >
                              {message.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Payments */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Payments</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportData('payments')}
                      data-testid="button-export-payments-overview"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {payments.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No payments yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">Payment transactions will appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {payments.slice(0, 5).map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">₹{payment.amount}</p>
                              <p className="text-sm text-muted-foreground">{payment.gatewayOrderId || 'N/A'}</p>
                            </div>
                            <Badge 
                              variant={payment.status === 'completed' ? 'default' : 'outline'}
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Lead Downloads */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Lead Downloads</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportData('lead-downloads')}
                      data-testid="button-export-lead-downloads"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No downloads yet</h3>
                      <p className="text-gray-500 dark:text-gray-400">Lead downloads will appear here when available.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('bookings')}
                  data-testid="button-export-bookings"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.recentBookings?.slice(0, 10).map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            {'serviceType' in booking ? (
                              <Badge variant="default">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Consultation
                              </Badge>
                            ) : 'programName' in booking ? (
                              <Badge className="bg-chart-2">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Mentoria
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <BookOpen className="w-3 h-3 mr-1" />
                                Workshop
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{booking.contactName}</TableCell>
                          <TableCell>{booking.contactEmail}</TableCell>
                          <TableCell>{booking.contactPhone || "N/A"}</TableCell>
                          <TableCell>
                            {'serviceType' in booking 
                              ? booking.serviceType
                              : 'programName' in booking
                                ? `${booking.programName} - ${booking.tier === 'standard' ? 'Standard' : 'Premium'}`
                                : ('workshopTitle' in booking ? booking.workshopTitle : "N/A")
                            }
                          </TableCell>
                          <TableCell>
                            {'createdAt' in booking 
                              ? formatDate(booking.createdAt)
                              : 'registrationDate' in booking 
                                ? formatDate(booking.registrationDate)
                                : "N/A"
                            }
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
                        </TableRow>
                      )) || []}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>



          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payment Transactions</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('payments')}
                  data-testid="button-export-payments"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {paymentsError && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      Failed to load payments. Please try again later.
                    </AlertDescription>
                  </Alert>
                )}

                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Gateway</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.paymentType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(Number(payment.amount))}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell>{payment.paymentGateway}</TableCell>
                          <TableCell>{formatDate(payment.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {payment.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdatePaymentStatus(payment.id, 'completed')}
                                  disabled={updatePaymentStatusMutation.isPending}
                                  data-testid={`button-complete-payment-${payment.id}`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {payment.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdatePaymentStatus(payment.id, 'refunded')}
                                  disabled={updatePaymentStatusMutation.isPending}
                                  data-testid={`button-refund-payment-${payment.id}`}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Forms Tab */}
          <TabsContent value="contact-forms">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Contact Messages</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('contact-messages')}
                  data-testid="button-export-contact-messages"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Contact Messages
                </Button>
              </CardHeader>
              <CardContent>
                {contactMessagesError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Error loading contact messages. Please try again later.
                    </AlertDescription>
                  </Alert>
                ) : contactMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Contact Messages</h3>
                    <p className="text-gray-500 dark:text-gray-400">Contact messages will appear here when customers submit inquiries.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="font-medium" data-testid={`text-contact-name-${message.id}`}>
                                {message.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <a
                              href={`mailto:${message.email}`}
                              className="text-blue-600 hover:underline"
                              data-testid={`link-contact-email-${message.id}`}
                            >
                              {message.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {message.phone ? (
                              <a
                                href={`tel:${message.phone}`}
                                className="text-blue-600 hover:underline"
                                data-testid={`link-contact-phone-${message.id}`}
                              >
                                {message.phone}
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate" title={message.message}>
                              <span data-testid={`text-contact-message-${message.id}`}>
                                {message.message}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <select
                              value={message.status}
                              onChange={(e) => handleUpdateContactMessageStatus(message.id, e.target.value)}
                              className="px-2 py-1 border rounded text-sm"
                              data-testid={`select-contact-status-${message.id}`}
                            >
                              <option value="unread">Unread</option>
                              <option value="read">Read</option>
                              <option value="replied">Replied</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div data-testid={`text-contact-date-${message.id}`}>
                                {new Date(message.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-gray-500">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteContactMessage(message.id)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-contact-${message.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lead Downloads Tab */}
          <TabsContent value="lead-downloads">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lead Downloads</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('lead-downloads')}
                  data-testid="button-export-lead-downloads"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Lead Downloads Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Track downloadable resources and lead generation materials.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Resource Downloads</p>
                          <p className="text-2xl font-bold">0</p>
                        </div>
                        <Download className="h-8 w-8 text-blue-600" />
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Active Resources</p>
                          <p className="text-2xl font-bold">0</p>
                        </div>
                        <FileText className="h-8 w-8 text-green-600" />
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Lead Conversions</p>
                          <p className="text-2xl font-bold">0</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                      </div>
                    </Card>
                  </div>
                  <div className="mt-6">
                    <Button variant="outline" disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Resource (Coming Soon)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}