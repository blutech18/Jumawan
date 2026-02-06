import { create } from 'zustand';
import { supabase, WorkExperience } from '@/lib/supabase';

interface ExperienceState {
  experiences: WorkExperience[];
  loading: boolean;
  error: string | null;
  fetchExperiences: () => Promise<void>;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  experiences: [],
  loading: false,
  error: null,
  fetchExperiences: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('work_experience')
        .select('*')
        .order('order_index', { ascending: true })
        .order('start_date', { ascending: false });

      if (error) throw error;
      set({ experiences: data || [] });
    } catch (error) {
      console.error('Error fetching work experience:', error);
      set({ error: (error as Error).message || 'An unknown error occurred' });
    } finally {
      set({ loading: false });
    }
  },
}));
