import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: 'daily' | 'weekly';
  color: string | null;
  is_active: boolean;
  created_at: string;
}

export interface HabitCheckin {
  id: string;
  habit_id: string;
  user_id: string;
  checked_at: string;
  completed: boolean;
}

export const useHabits = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });
};

export const useHabitCheckins = (habitId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['habit_checkins', user?.id, habitId],
    queryFn: async () => {
      let query = supabase
        .from('habit_checkins')
        .select('*')
        .order('checked_at', { ascending: false });
      
      if (habitId) {
        query = query.eq('habit_id', habitId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as HabitCheckin[];
    },
    enabled: !!user,
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('habits')
        .insert({ ...habit, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useToggleHabitCheckin = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      // Check if checkin exists
      const { data: existing } = await supabase
        .from('habit_checkins')
        .select('*')
        .eq('habit_id', habitId)
        .eq('checked_at', date)
        .maybeSingle();
      
      if (existing) {
        // Delete checkin
        const { error } = await supabase
          .from('habit_checkins')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return null;
      } else {
        // Create checkin
        const { data, error } = await supabase
          .from('habit_checkins')
          .insert({ habit_id: habitId, user_id: user!.id, checked_at: date, completed: true })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit_checkins'] });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};
