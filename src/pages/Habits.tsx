import React, { useState } from 'react';
import { useHabits, useHabitCheckins, useCreateHabit, useToggleHabitCheckin, useDeleteHabit } from '@/hooks/useHabits';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Target, Flame, Calendar, Check, Trash2 } from 'lucide-react';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

const Habits = () => {
  const { data: habits, isLoading } = useHabits();
  const { data: checkins } = useHabitCheckins();
  const createHabit = useCreateHabit();
  const toggleCheckin = useToggleHabitCheckin();
  const deleteHabit = useDeleteHabit();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly',
    color: '#00d4ff',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHabit.mutateAsync({
        ...form,
        is_active: true,
      });
      toast({ title: 'Habit created successfully!' });
      setForm({ name: '', description: '', frequency: 'daily', color: '#00d4ff' });
      setIsOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create habit', variant: 'destructive' });
    }
  };

  const handleToggleCheckin = async (habitId: string, date: Date) => {
    try {
      await toggleCheckin.mutateAsync({ habitId, date: format(date, 'yyyy-MM-dd') });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update check-in', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHabit.mutateAsync(id);
      toast({ title: 'Habit archived' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete habit', variant: 'destructive' });
    }
  };

  // Calculate streaks and consistency
  const calculateStreak = (habitId: string): number => {
    if (!checkins) return 0;
    const habitCheckins = checkins
      .filter(c => c.habit_id === habitId)
      .map(c => new Date(c.checked_at))
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (habitCheckins.length === 0) return 0;
    
    let streak = 0;
    let currentDate = startOfDay(new Date());
    
    for (let i = 0; i < 365; i++) {
      const checkDate = subDays(currentDate, i);
      if (habitCheckins.some(c => isSameDay(c, checkDate))) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const calculateConsistency = (habitId: string): number => {
    if (!checkins) return 0;
    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i));
    const habitCheckins = checkins.filter(c => c.habit_id === habitId);
    const completedDays = last30Days.filter(day =>
      habitCheckins.some(c => isSameDay(new Date(c.checked_at), day))
    ).length;
    return Math.round((completedDays / 30) * 100);
  };

  const isCheckedOn = (habitId: string, date: Date): boolean => {
    if (!checkins) return false;
    return checkins.some(c => 
      c.habit_id === habitId && isSameDay(new Date(c.checked_at), date)
    );
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

  // Overall stats
  const totalHabits = habits?.length || 0;
  const avgConsistency = habits && habits.length > 0
    ? Math.round(habits.reduce((acc, h) => acc + calculateConsistency(h.id), 0) / habits.length)
    : 0;
  const totalStreak = habits && habits.length > 0
    ? Math.max(...habits.map(h => calculateStreak(h.id)))
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-success" />
            Habit Tracker
          </h1>
          <p className="text-muted-foreground mt-1">Build consistency and track your streaks</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="lg">
              <Plus className="w-5 h-5" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Habit Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Morning meditation"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description (optional)</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Why is this habit important to you?"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Frequency</label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Color</label>
                <div className="flex gap-2 mt-2">
                  {['#00d4ff', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${form.color === color ? 'scale-125 ring-2 ring-offset-2 ring-offset-background ring-foreground' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" variant="gradient" className="w-full" disabled={createHabit.isPending}>
                {createHabit.isPending ? 'Creating...' : 'Create Habit'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="statPrimary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Habits</p>
              <p className="text-3xl font-bold">{totalHabits}</p>
            </div>
            <Target className="w-10 h-10 text-primary opacity-50" />
          </div>
        </Card>
        <Card variant="statSuccess">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Consistency</p>
              <p className="text-3xl font-bold">{avgConsistency}%</p>
            </div>
            <Calendar className="w-10 h-10 text-success opacity-50" />
          </div>
        </Card>
        <Card variant="statWarning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <p className="text-3xl font-bold">{totalStreak} days</p>
            </div>
            <Flame className="w-10 h-10 text-warning opacity-50" />
          </div>
        </Card>
      </div>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading habits...</div>
      ) : habits?.length === 0 ? (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No habits created yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first habit to start building consistency</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {habits?.map((habit) => {
            const streak = calculateStreak(habit.id);
            const consistency = calculateConsistency(habit.id);
            
            return (
              <Card key={habit.id} variant="glassHover" className="overflow-hidden">
                <div className="h-1" style={{ backgroundColor: habit.color || '#00d4ff' }} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{habit.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(habit.id)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                  {habit.description && (
                    <CardDescription>{habit.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-warning" />
                      <span className="font-medium">{streak}</span>
                      <span className="text-muted-foreground">day streak</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{consistency}%</span>
                      <span className="text-muted-foreground">consistency</span>
                    </div>
                  </div>
                  
                  {/* Check-in grid */}
                  <div className="flex items-center justify-between gap-2">
                    {last7Days.map((day) => {
                      const isChecked = isCheckedOn(habit.id, day);
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => handleToggleCheckin(habit.id, day)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                            isToday ? 'bg-primary/10' : ''
                          }`}
                        >
                          <span className="text-xs text-muted-foreground">{format(day, 'EEE')}</span>
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              isChecked
                                ? 'text-primary-foreground'
                                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                            }`}
                            style={isChecked ? { backgroundColor: habit.color || '#00d4ff' } : {}}
                          >
                            {isChecked && <Check className="w-4 h-4" />}
                          </div>
                          <span className="text-xs text-muted-foreground">{format(day, 'd')}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Habits;
