import { create } from 'zustand';
import { WorkExperience } from '@/lib/supabase';
import { safeSupabase } from '@/lib/supabase-safe';

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
    
    const { data } = await safeSupabase.safeQuery<WorkExperience[]>(
      async (client) => {
        return await client
          .from('work_experience')
          .select('*')
          .order('order_index', { ascending: true })
          .order('start_date', { ascending: false });
      },
      [] // Fallback to empty array
    );

    set({ experiences: data || [], loading: false });
  },
}));
