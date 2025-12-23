import React, { useState } from 'react';
import { useSkills, useSkillRatings, useCreateSkill, useAddSkillRating, useDeleteSkill } from '@/hooks/useSkills';
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
import { Slider } from '@/components/ui/slider';
import { Plus, TrendingUp, Star, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Skills = () => {
  const { data: skills, isLoading } = useSkills();
  const { data: allRatings } = useSkillRatings();
  const createSkill = useCreateSkill();
  const addRating = useAddSkillRating();
  const deleteSkill = useDeleteSkill();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
  });
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    notes: '',
    proof_link: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSkill.mutateAsync(form);
      toast({ title: 'Skill added successfully!' });
      setForm({ name: '', category: '' });
      setIsOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add skill', variant: 'destructive' });
    }
  };

  const handleAddRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) return;
    
    try {
      await addRating.mutateAsync({
        skill_id: selectedSkill,
        rating: ratingForm.rating,
        notes: ratingForm.notes || null,
        proof_link: ratingForm.proof_link || null,
        rated_at: format(new Date(), 'yyyy-MM-dd'),
      });
      toast({ title: 'Rating added!' });
      setRatingForm({ rating: 5, notes: '', proof_link: '' });
      setRatingDialogOpen(false);
      setSelectedSkill(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add rating', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill.mutateAsync(id);
      toast({ title: 'Skill deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete skill', variant: 'destructive' });
    }
  };

  const getSkillRatings = (skillId: string) => {
    if (!allRatings) return [];
    return allRatings.filter(r => r.skill_id === skillId).sort((a, b) => 
      new Date(a.rated_at).getTime() - new Date(b.rated_at).getTime()
    );
  };

  const getLatestRating = (skillId: string): number => {
    const ratings = getSkillRatings(skillId);
    return ratings.length > 0 ? ratings[ratings.length - 1].rating : 0;
  };

  const getGrowth = (skillId: string): number => {
    const ratings = getSkillRatings(skillId);
    if (ratings.length < 2) return 0;
    return ratings[ratings.length - 1].rating - ratings[0].rating;
  };

  const avgSkillLevel = skills && skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + getLatestRating(s.id), 0) / skills.length * 10) / 10
    : 0;

  const totalGrowth = skills && skills.length > 0
    ? skills.reduce((acc, s) => acc + Math.max(0, getGrowth(s.id)), 0)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-accent" />
            Skill Growth
          </h1>
          <p className="text-muted-foreground mt-1">Track your skill development over time</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="lg">
              <Plus className="w-5 h-5" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Skill Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Python, Public Speaking, Leadership"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category (optional)</label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g., Technical, Soft Skills, Creative"
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full" disabled={createSkill.isPending}>
                {createSkill.isPending ? 'Adding...' : 'Add Skill'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Rate Your Progress</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRating} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Self Rating (1-10)</label>
              <div className="mt-4">
                <Slider
                  value={[ratingForm.rating]}
                  onValueChange={(v) => setRatingForm({ ...ratingForm, rating: v[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>Beginner</span>
                  <span className="text-2xl font-bold text-primary">{ratingForm.rating}</span>
                  <span>Expert</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes (optional)</label>
              <Textarea
                value={ratingForm.notes}
                onChange={(e) => setRatingForm({ ...ratingForm, notes: e.target.value })}
                placeholder="What did you learn or accomplish?"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Proof Link (optional)</label>
              <Input
                value={ratingForm.proof_link}
                onChange={(e) => setRatingForm({ ...ratingForm, proof_link: e.target.value })}
                placeholder="https://..."
                type="url"
              />
            </div>
            <Button type="submit" variant="gradient" className="w-full" disabled={addRating.isPending}>
              {addRating.isPending ? 'Saving...' : 'Save Rating'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="statAccent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Skills Tracked</p>
              <p className="text-3xl font-bold">{skills?.length || 0}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-accent opacity-50" />
          </div>
        </Card>
        <Card variant="statPrimary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Skill Level</p>
              <p className="text-3xl font-bold">{avgSkillLevel}/10</p>
            </div>
            <Star className="w-10 h-10 text-primary opacity-50" />
          </div>
        </Card>
        <Card variant="statSuccess">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Growth Points</p>
              <p className="text-3xl font-bold">+{totalGrowth}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-success opacity-50" />
          </div>
        </Card>
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading skills...</div>
      ) : skills?.length === 0 ? (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No skills tracked yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add skills to start tracking your growth</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {skills?.map((skill) => {
            const ratings = getSkillRatings(skill.id);
            const latestRating = getLatestRating(skill.id);
            const growth = getGrowth(skill.id);
            
            const chartData = ratings.map(r => ({
              date: format(new Date(r.rated_at), 'MMM d'),
              rating: r.rating,
            }));

            return (
              <Card key={skill.id} variant="glassHover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{skill.name}</CardTitle>
                      {skill.category && (
                        <CardDescription>{skill.category}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSkill(skill.id);
                          setRatingDialogOpen(true);
                        }}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Rate
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(skill.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats row */}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-2xl font-bold text-primary">{latestRating}</span>
                      <span className="text-muted-foreground">/10</span>
                    </div>
                    {growth !== 0 && (
                      <div className={`flex items-center gap-1 ${growth > 0 ? 'text-success' : 'text-destructive'}`}>
                        <TrendingUp className={`w-4 h-4 ${growth < 0 ? 'rotate-180' : ''}`} />
                        <span className="font-medium">{growth > 0 ? '+' : ''}{growth}</span>
                        <span className="text-muted-foreground">growth</span>
                      </div>
                    )}
                    <div className="text-muted-foreground">
                      {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {/* Chart */}
                  {chartData.length > 1 && (
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 15%)" />
                          <XAxis dataKey="date" stroke="hsl(240 5% 55%)" fontSize={10} />
                          <YAxis domain={[0, 10]} stroke="hsl(240 5% 55%)" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(240 10% 6%)', border: '1px solid hsl(240 10% 15%)' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="rating" 
                            stroke="hsl(280 100% 60%)" 
                            strokeWidth={2} 
                            dot={{ fill: 'hsl(280 100% 60%)' }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Recent ratings */}
                  {ratings.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Recent Progress</p>
                      {ratings.slice(-3).reverse().map((rating) => (
                        <div key={rating.id} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{rating.rating}/10</span>
                            {rating.notes && <span className="text-muted-foreground truncate max-w-[150px]">{rating.notes}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {rating.proof_link && (
                              <a href={rating.proof_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 text-primary" />
                              </a>
                            )}
                            <span className="text-xs text-muted-foreground">{format(new Date(rating.rated_at), 'MMM d')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Skills;
