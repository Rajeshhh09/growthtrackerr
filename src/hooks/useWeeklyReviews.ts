import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  what_worked: string | null;
  what_failed: string | null;
  main_distraction: string | null;
  improvement_plan: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export const useWeeklyReviews = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['weekly_reviews', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .order('week_start', { ascending: false });
      
      if (error) throw error;
      return data as WeeklyReview[];
    },
    enabled: !!user,
  });
};

export const useCreateWeeklyReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (review: Omit<WeeklyReview, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .insert({ ...review, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_reviews'] });
    },
  });
};

export const useUpdateWeeklyReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WeeklyReview> & { id: string }) => {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_reviews'] });
    },
  });
};
