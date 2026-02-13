import { create } from 'zustand';
import { Project } from '@/lib/supabase';
import { safeSupabase } from '@/lib/supabase-safe';

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
    
    const { data } = await safeSupabase.safeQuery<Project[]>(
      async (client) => {
        return await client
          .from('projects')
          .select('*')
          .eq('featured', true)
          .order('order_index', { ascending: true });
      },
      [] // Fallback to empty array
    );

    set({ projects: data || [], loading: false });
  },
}));
