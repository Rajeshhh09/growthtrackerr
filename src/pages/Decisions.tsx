import React, { useState } from 'react';
import { useDecisions, useCreateDecision, useUpdateDecision, useDeleteDecision, Decision } from '@/hooks/useDecisions';
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
import { Plus, Scale, TrendingUp, AlertCircle, CheckCircle, XCircle, Clock, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const emotionalStates = ['calm', 'stressed', 'excited', 'anxious', 'confident', 'uncertain', 'frustrated', 'motivated'] as const;
const outcomes = ['pending', 'successful', 'neutral', 'failed'] as const;

const outcomeColors = {
  pending: 'text-muted-foreground',
  successful: 'text-success',
  neutral: 'text-warning',
  failed: 'text-destructive',
};

const outcomeIcons = {
  pending: Clock,
  successful: CheckCircle,
  neutral: AlertCircle,
  failed: XCircle,
};

const Decisions = () => {
  const { data: decisions, isLoading } = useDecisions();
  const createDecision = useCreateDecision();
  const updateDecision = useUpdateDecision();
  const deleteDecision = useDeleteDecision();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    options_considered: '',
    emotional_state: 'calm' as typeof emotionalStates[number],
    expected_outcome: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDecision.mutateAsync({
        ...form,
        options_considered: form.options_considered.split(',').map(o => o.trim()).filter(Boolean),
        actual_outcome: 'pending',
        outcome_notes: null,
      });
      toast({ title: 'Decision logged successfully!' });
      setForm({ title: '', description: '', options_considered: '', emotional_state: 'calm', expected_outcome: '' });
      setIsOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to log decision', variant: 'destructive' });
    }
  };

  const handleUpdateOutcome = async (id: string, outcome: typeof outcomes[number]) => {
    try {
      await updateDecision.mutateAsync({ id, actual_outcome: outcome });
      toast({ title: 'Outcome updated!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update outcome', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDecision.mutateAsync(id);
      toast({ title: 'Decision deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete decision', variant: 'destructive' });
    }
  };

  // Analytics calculations
  const successRate = decisions?.length 
    ? Math.round((decisions.filter(d => d.actual_outcome === 'successful').length / decisions.filter(d => d.actual_outcome !== 'pending').length) * 100) || 0
    : 0;

  const emotionalPatterns = emotionalStates.map(state => ({
    name: state,
    count: decisions?.filter(d => d.emotional_state === state).length || 0,
  })).filter(e => e.count > 0);

  const outcomeData = [
    { name: 'Successful', value: decisions?.filter(d => d.actual_outcome === 'successful').length || 0, color: '#22c55e' },
    { name: 'Neutral', value: decisions?.filter(d => d.actual_outcome === 'neutral').length || 0, color: '#f59e0b' },
    { name: 'Failed', value: decisions?.filter(d => d.actual_outcome === 'failed').length || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Scale className="w-8 h-8 text-primary" />
            Decision Journal
          </h1>
          <p className="text-muted-foreground mt-1">Track your decisions and analyze patterns</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="lg">
              <Plus className="w-5 h-5" />
              Log Decision
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log New Decision</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="What decision did you make?"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the context and reasoning..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Options Considered (comma-separated)</label>
                <Input
                  value={form.options_considered}
                  onChange={(e) => setForm({ ...form, options_considered: e.target.value })}
                  placeholder="Option A, Option B, Option C"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Emotional State</label>
                <Select value={form.emotional_state} onValueChange={(v) => setForm({ ...form, emotional_state: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {emotionalStates.map(state => (
                      <SelectItem key={state} value={state} className="capitalize">{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Expected Outcome</label>
                <Textarea
                  value={form.expected_outcome}
                  onChange={(e) => setForm({ ...form, expected_outcome: e.target.value })}
                  placeholder="What do you expect will happen?"
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full" disabled={createDecision.isPending}>
                {createDecision.isPending ? 'Saving...' : 'Log Decision'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="statPrimary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Decisions</p>
              <p className="text-3xl font-bold">{decisions?.length || 0}</p>
            </div>
            <Scale className="w-10 h-10 text-primary opacity-50" />
          </div>
        </Card>
        <Card variant="statSuccess">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-3xl font-bold">{successRate}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-success opacity-50" />
          </div>
        </Card>
        <Card variant="statWarning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-3xl font-bold">{decisions?.filter(d => d.actual_outcome === 'pending').length || 0}</p>
            </div>
            <Clock className="w-10 h-10 text-warning opacity-50" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      {decisions && decisions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Outcome Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {outcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(240 10% 6%)', border: '1px solid hsl(240 10% 15%)' }}
                      labelStyle={{ color: 'hsl(0 0% 98%)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {outcomeData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Emotional Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={emotionalPatterns}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 15%)" />
                    <XAxis dataKey="name" stroke="hsl(240 5% 55%)" fontSize={12} />
                    <YAxis stroke="hsl(240 5% 55%)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(240 10% 6%)', border: '1px solid hsl(240 10% 15%)' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="hsl(187 100% 42%)" strokeWidth={2} dot={{ fill: 'hsl(187 100% 42%)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Decision List */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Decision History</CardTitle>
          <CardDescription>Review and update your past decisions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading decisions...</div>
          ) : decisions?.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No decisions logged yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start tracking your decisions to see patterns</p>
            </div>
          ) : (
            <div className="space-y-4">
              {decisions?.map((decision) => {
                const OutcomeIcon = outcomeIcons[decision.actual_outcome];
                return (
                  <div
                    key={decision.id}
                    className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <OutcomeIcon className={`w-5 h-5 ${outcomeColors[decision.actual_outcome]}`} />
                          <h3 className="font-semibold">{decision.title}</h3>
                          <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary capitalize">
                            {decision.emotional_state}
                          </span>
                        </div>
                        {decision.description && (
                          <p className="text-sm text-muted-foreground mb-2">{decision.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{format(new Date(decision.created_at), 'MMM d, yyyy')}</span>
                          {decision.options_considered && decision.options_considered.length > 0 && (
                            <span>{decision.options_considered.length} options considered</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={decision.actual_outcome}
                          onValueChange={(v) => handleUpdateOutcome(decision.id, v as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {outcomes.map(outcome => (
                              <SelectItem key={outcome} value={outcome} className="capitalize">{outcome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(decision.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Decisions;
