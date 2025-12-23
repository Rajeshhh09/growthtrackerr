import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDecisions } from '@/hooks/useDecisions';
import { useHabits, useHabitCheckins } from '@/hooks/useHabits';
import { useSkills } from '@/hooks/useSkills';
import { useWeeklyReviews } from '@/hooks/useWeeklyReviews';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Scale, Target, TrendingUp, ClipboardList, Plus, Zap, AlertTriangle } from 'lucide-react';
import { startOfDay, subDays, isSameDay } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: decisions } = useDecisions();
  const { data: habits } = useHabits();
  const { data: checkins } = useHabitCheckins();
  const { data: skills } = useSkills();
  const { data: reviews } = useWeeklyReviews();

  // Calculate habit consistency
  const calculateAvgConsistency = (): number => {
    if (!habits || !checkins || habits.length === 0) return 0;
    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i));
    let totalConsistency = 0;
    habits.forEach(habit => {
      const habitCheckins = checkins.filter(c => c.habit_id === habit.id);
      const completedDays = last30Days.filter(day =>
        habitCheckins.some(c => isSameDay(new Date(c.checked_at), day))
      ).length;
      totalConsistency += (completedDays / 30) * 100;
    });
    return Math.round(totalConsistency / habits.length);
  };

  // Generate insights
  const generateInsights = (): string[] => {
    const insights: string[] = [];
    
    if (profile?.goals && habits && habits.length === 0) {
      insights.push("You've set goals but haven't created habits to support them. Start building daily routines!");
    }
    
    if (decisions && decisions.filter(d => d.actual_outcome === 'failed').length > 3) {
      insights.push("Multiple decisions marked as failed. Consider reviewing your decision-making patterns.");
    }
    
    const consistency = calculateAvgConsistency();
    if (consistency < 50 && habits && habits.length > 0) {
      insights.push("Your habit consistency is below 50%. Focus on showing up daily, even for small actions.");
    }
    
    if (!reviews || reviews.length === 0) {
      insights.push("Start doing weekly reviews to reflect on your progress and plan improvements.");
    }
    
    return insights.length > 0 ? insights : ["Keep tracking your progress to receive personalized insights!"];
  };

  const stats = [
    { label: 'Decisions Logged', value: decisions?.length || 0, icon: Scale, variant: 'statPrimary' as const, href: '/decisions' },
    { label: 'Habit Consistency', value: `${calculateAvgConsistency()}%`, icon: Target, variant: 'statSuccess' as const, href: '/habits' },
    { label: 'Skills Tracked', value: skills?.length || 0, icon: TrendingUp, variant: 'statAccent' as const, href: '/skills' },
    { label: 'Weekly Reviews', value: reviews?.length || 0, icon: ClipboardList, variant: 'statWarning' as const, href: '/reviews' },
  ];

  const quickActions = [
    { label: 'Log Decision', icon: Scale, href: '/decisions', color: 'from-primary to-cyan-400' },
    { label: 'Track Habit', icon: Target, href: '/habits', color: 'from-success to-emerald-400' },
    { label: 'Rate Skill', icon: TrendingUp, href: '/skills', color: 'from-accent to-pink-400' },
    { label: 'Weekly Review', icon: ClipboardList, href: '/reviews', color: 'from-warning to-orange-400' },
  ];

  const insights = generateInsights();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back
            {(profile?.full_name || user?.user_metadata?.full_name) && (
              <span className="text-primary">, {profile?.full_name || user?.user_metadata?.full_name}</span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Track your growth and make better decisions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Ready to grow</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card variant={stat.variant} className="cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className="w-10 h-10 opacity-50" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card variant="glass">
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Quick Actions</CardTitle></CardHeader>
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

      <Card variant="glass" className="border-warning/30">
        <CardHeader><CardTitle className="flex items-center gap-2 text-warning"><AlertTriangle className="w-5 h-5" />Reality Check Insights</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/10">
                <Zap className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
