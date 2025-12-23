import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Scale, Target, TrendingUp, ClipboardList, Plus, Zap, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Decisions Logged', value: '0', icon: Scale, variant: 'statPrimary' as const, href: '/decisions' },
    { label: 'Habit Consistency', value: '0%', icon: Target, variant: 'statSuccess' as const, href: '/habits' },
    { label: 'Skills Tracked', value: '0', icon: TrendingUp, variant: 'statAccent' as const, href: '/skills' },
    { label: 'Weekly Reviews', value: '0', icon: ClipboardList, variant: 'statWarning' as const, href: '/reviews' },
  ];

  const quickActions = [
    { label: 'Log Decision', icon: Scale, href: '/decisions', color: 'from-primary to-cyan-400' },
    { label: 'Track Habit', icon: Target, href: '/habits', color: 'from-success to-emerald-400' },
    { label: 'Rate Skill', icon: TrendingUp, href: '/skills', color: 'from-accent to-pink-400' },
    { label: 'Weekly Review', icon: ClipboardList, href: '/reviews', color: 'from-warning to-orange-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back
            {user?.user_metadata?.full_name && (
              <span className="text-primary">, {user.user_metadata.full_name}</span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Track your growth and make better decisions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Ready to grow</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link key={stat.label} to={stat.href}>
            <Card variant={stat.variant} className={`animate-fade-in-up animation-delay-${(index + 1) * 100} cursor-pointer hover:scale-[1.02] transition-transform`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-foreground/5 to-foreground/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <Button variant="glass" size="lg" className="w-full h-24 flex-col gap-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-sm">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reality Check Card */}
      <Card variant="glass" className="border-warning/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            Reality Check Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Start logging decisions, habits, and skills to receive personalized insights about your growth patterns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
