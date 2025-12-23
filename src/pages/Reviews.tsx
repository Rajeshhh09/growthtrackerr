import React, { useState } from 'react';
import { useWeeklyReviews, useCreateWeeklyReview, useUpdateWeeklyReview } from '@/hooks/useWeeklyReviews';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, ClipboardList, CheckCircle, XCircle, AlertTriangle, Lightbulb, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const Reviews = () => {
  const { data: reviews, isLoading } = useWeeklyReviews();
  const createReview = useCreateWeeklyReview();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    what_worked: '',
    what_failed: '',
    main_distraction: '',
    improvement_plan: '',
  });

  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const hasCurrentWeekReview = reviews?.some(r => r.week_start === currentWeekStart);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Generate summary from the inputs
      const summary = `Week Summary: ${form.what_worked ? 'Achieved: ' + form.what_worked.slice(0, 50) + '... ' : ''}${form.improvement_plan ? 'Focus: ' + form.improvement_plan.slice(0, 50) : ''}`;
      
      await createReview.mutateAsync({
        ...form,
        week_start: currentWeekStart,
        summary,
      });
      toast({ title: 'Weekly review saved!' });
      setForm({ what_worked: '', what_failed: '', main_distraction: '', improvement_plan: '' });
      setIsOpen(false);
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast({ title: 'Error', description: 'You already have a review for this week', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to save review', variant: 'destructive' });
      }
    }
  };

  const formatWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = endOfWeek(start, { weekStartsOn: 1 });
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-warning" />
            Weekly Reviews
          </h1>
          <p className="text-muted-foreground mt-1">Reflect on your progress and plan ahead</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="lg" disabled={hasCurrentWeekReview}>
              <Plus className="w-5 h-5" />
              {hasCurrentWeekReview ? 'Review Completed' : 'New Review'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Weekly Review</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Week of {formatWeekRange(currentWeekStart)}
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-success mb-2">
                  <CheckCircle className="w-4 h-4" />
                  What Worked Well?
                </label>
                <Textarea
                  value={form.what_worked}
                  onChange={(e) => setForm({ ...form, what_worked: e.target.value })}
                  placeholder="List your wins, achievements, and things that went well this week..."
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
                  <XCircle className="w-4 h-4" />
                  What Didn't Work?
                </label>
                <Textarea
                  value={form.what_failed}
                  onChange={(e) => setForm({ ...form, what_failed: e.target.value })}
                  placeholder="What challenges did you face? What could have gone better?"
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-warning mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Main Distraction
                </label>
                <Textarea
                  value={form.main_distraction}
                  onChange={(e) => setForm({ ...form, main_distraction: e.target.value })}
                  placeholder="What pulled you away from your priorities the most?"
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Improvement Plan
                </label>
                <Textarea
                  value={form.improvement_plan}
                  onChange={(e) => setForm({ ...form, improvement_plan: e.target.value })}
                  placeholder="What will you do differently next week? What's your focus?"
                  className="min-h-[100px]"
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full" disabled={createReview.isPending}>
                {createReview.isPending ? 'Saving...' : 'Save Review'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="statWarning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-3xl font-bold">{reviews?.length || 0}</p>
            </div>
            <ClipboardList className="w-10 h-10 text-warning opacity-50" />
          </div>
        </Card>
        <Card variant="statSuccess">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weeks Reviewed</p>
              <p className="text-3xl font-bold">{reviews?.length || 0}</p>
            </div>
            <Calendar className="w-10 h-10 text-success opacity-50" />
          </div>
        </Card>
        <Card variant="statPrimary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Week</p>
              <p className="text-lg font-bold">{hasCurrentWeekReview ? 'Done ✓' : 'Pending'}</p>
            </div>
            {hasCurrentWeekReview ? (
              <CheckCircle className="w-10 h-10 text-success opacity-50" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-warning opacity-50" />
            )}
          </div>
        </Card>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
      ) : reviews?.length === 0 ? (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No weekly reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start your first weekly review to track your progress</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews?.map((review) => (
            <Card key={review.id} variant="glassHover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      {formatWeekRange(review.week_start)}
                    </CardTitle>
                    {review.summary && (
                      <CardDescription className="mt-1">{review.summary}</CardDescription>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {review.what_worked && (
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                      <div className="flex items-center gap-2 text-success mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">What Worked</span>
                      </div>
                      <p className="text-sm text-foreground">{review.what_worked}</p>
                    </div>
                  )}
                  {review.what_failed && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div className="flex items-center gap-2 text-destructive mb-2">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">What Didn't Work</span>
                      </div>
                      <p className="text-sm text-foreground">{review.what_failed}</p>
                    </div>
                  )}
                  {review.main_distraction && (
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                      <div className="flex items-center gap-2 text-warning mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Main Distraction</span>
                      </div>
                      <p className="text-sm text-foreground">{review.main_distraction}</p>
                    </div>
                  )}
                  {review.improvement_plan && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Lightbulb className="w-4 h-4" />
                        <span className="text-sm font-medium">Improvement Plan</span>
                      </div>
                      <p className="text-sm text-foreground">{review.improvement_plan}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
