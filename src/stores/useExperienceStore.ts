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
