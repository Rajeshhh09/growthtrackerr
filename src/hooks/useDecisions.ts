import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Decision {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  options_considered: string[] | null;
  emotional_state: 'calm' | 'stressed' | 'excited' | 'anxious' | 'confident' | 'uncertain' | 'frustrated' | 'motivated';
  expected_outcome: string | null;
  actual_outcome: 'pending' | 'successful' | 'neutral' | 'failed';
  outcome_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useDecisions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['decisions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Decision[];
    },
    enabled: !!user,
  });
};

export const useCreateDecision = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (decision: Omit<Decision, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('decisions')
        .insert({ ...decision, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    },
  });
};

export const useUpdateDecision = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Decision> & { id: string }) => {
      const { data, error } = await supabase
        .from('decisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    },
  });
};

export const useDeleteDecision = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    },
  });
};
