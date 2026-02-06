import { create } from 'zustand';
import { supabase, Project } from '@/lib/supabase';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,
  error: null,
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      set({ projects: data || [] });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ error: (error as Error).message || 'An unknown error occurred' });
    } finally {
      set({ loading: false });
    }
  },
}));
