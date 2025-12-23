import React, { useState } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, User, Target, Zap, Shield, Loader2 } from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    full_name: '',
    goals: '',
    strengths: '',
    weaknesses: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        goals: profile.goals || '',
        strengths: profile.strengths || '',
        weaknesses: profile.weaknesses || '',
      });
    }
  }, [profile]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(form);
      toast({ title: 'Profile updated successfully!' });
      setHasChanges(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Card */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details and growth goals</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <Input
                  value={form.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="opacity-50"
                />
              </div>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Target className="w-4 h-4 text-primary" />
                Your Goals
              </label>
              <Textarea
                value={form.goals}
                onChange={(e) => handleChange('goals', e.target.value)}
                placeholder="What are your main goals? What do you want to achieve?"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Zap className="w-4 h-4 text-success" />
                  Strengths
                </label>
                <Textarea
                  value={form.strengths}
                  onChange={(e) => handleChange('strengths', e.target.value)}
                  placeholder="What are you good at? What comes naturally to you?"
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Shield className="w-4 h-4 text-warning" />
                  Areas to Improve
                </label>
                <Textarea
                  value={form.weaknesses}
                  onChange={(e) => handleChange('weaknesses', e.target.value)}
                  placeholder="What do you struggle with? What would you like to improve?"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => signOut()}
                className="text-destructive hover:bg-destructive/10"
              >
                Sign Out
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={!hasChanges || updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">User ID</p>
                <p className="text-sm text-muted-foreground">{user?.id}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Verified</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
