import { motion } from 'framer-motion';
import { Calendar, BookOpen, CreditCard, Settings, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import type { User, Consultation, Subscription } from '@shared/schema';

interface DashboardProps {
  user: User | undefined;
}

export default function Dashboard({ user }: DashboardProps) {
  const { data: consultations = [] } = useQuery<Consultation[]>({
    queryKey: ['/api/consultations'],
    enabled: !!user,
  });

  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ['/api/subscriptions'],
    enabled: !!user,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your personalized dashboard for career guidance and learning
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <motion.div variants={itemVariants}>
              <Card className="glass hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consultations</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{consultations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total sessions booked
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscriptions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Current subscriptions
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-muted-foreground">
                    Completion rate
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile</CardTitle>
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.role}</div>
                  <p className="text-xs text-muted-foreground">
                    Account type
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="glass">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with your career development journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    className="h-auto p-6 flex flex-col items-center space-y-2"
                    variant="outline"
                    data-testid="button-book-consultation"
                  >
                    <Calendar className="w-8 h-8 text-primary" />
                    <span className="font-semibold">Book Consultation</span>
                    <span className="text-xs text-muted-foreground">Schedule a career guidance session</span>
                  </Button>

                  <Button 
                    className="h-auto p-6 flex flex-col items-center space-y-2"
                    variant="outline"
                    data-testid="button-browse-workshops"
                  >
                    <BookOpen className="w-8 h-8 text-primary" />
                    <span className="font-semibold">Browse Workshops</span>
                    <span className="text-xs text-muted-foreground">Explore upcoming seminars</span>
                  </Button>

                  <Button 
                    className="h-auto p-6 flex flex-col items-center space-y-2"
                    variant="outline"
                    data-testid="button-manage-subscription"
                  >
                    <CreditCard className="w-8 h-8 text-primary" />
                    <span className="font-semibold">Manage Plan</span>
                    <span className="text-xs text-muted-foreground">Update your subscription</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest consultations and workshop registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No consultations yet. Book your first session to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultations.slice(0, 3).map((consultation) => (
                      <div 
                        key={consultation.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                      >
                        <div>
                          <h4 className="font-medium">{consultation.serviceType.replace('_', ' ')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(consultation.preferredDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          consultation.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : consultation.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {consultation.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}