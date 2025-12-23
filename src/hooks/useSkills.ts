import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  created_at: string;
}

export interface SkillRating {
  id: string;
  skill_id: string;
  user_id: string;
  rating: number;
  notes: string | null;
  proof_link: string | null;
  rated_at: string;
  created_at: string;
}

export const useSkills = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['skills', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Skill[];
    },
    enabled: !!user,
  });
};

export const useSkillRatings = (skillId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['skill_ratings', user?.id, skillId],
    queryFn: async () => {
      let query = supabase
        .from('skill_ratings')
        .select('*')
        .order('rated_at', { ascending: true });
      
      if (skillId) {
        query = query.eq('skill_id', skillId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SkillRating[];
    },
    enabled: !!user,
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (skill: Omit<Skill, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('skills')
        .insert({ ...skill, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

export const useAddSkillRating = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (rating: Omit<SkillRating, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('skill_ratings')
        .insert({ ...rating, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill_ratings'] });
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};
