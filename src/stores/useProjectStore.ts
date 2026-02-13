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
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      const isNetworkError = errorMessage.includes('Failed to fetch') || 
                            errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
                            errorMessage.includes('NetworkError');
      // Don't show network errors to users, just log them
      set({ error: isNetworkError ? null : errorMessage });
    } finally {
      set({ loading: false });
    }
  },
}));
