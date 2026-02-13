import { create } from 'zustand';
import { safeSupabase } from '@/lib/supabase-safe';

export interface HeroSetting {
    id: string;
    type: 'badge' | 'resume' | 'profile_image';
    value: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface HeroSettingsState {
    badges: string[];
    resumeUrl: string;
    profileImageUrl: string;
    loading: boolean;
    error: string | null;
    fetchSettings: () => Promise<void>;
}

export const useHeroSettingsStore = create<HeroSettingsState>((set) => ({
    badges: [],
    resumeUrl: '/Jumawan-Resume-UPDATED.png', // Default fallback
    profileImageUrl: '/placeholder.svg', // Default fallback - use placeholder instead of non-existent me.jpg
    loading: false,
    error: null,

    fetchSettings: async () => {
        set({ loading: true, error: null });

        const { data } = await safeSupabase.safeQuery<HeroSetting[]>(
            async (client) => {
                return await client
                    .from('hero_settings')
                    .select('*')
                    .eq('is_active', true)
                    .order('order_index', { ascending: true });
            },
            [] // Fallback to empty array - will use defaults
        );

        const badgeValues = data
            ?.filter((item: HeroSetting) => item.type === 'badge')
            .map((item: HeroSetting) => item.value) || [];

        const resume = data?.find((item: HeroSetting) => item.type === 'resume');
        // Use actual value (even if empty) when resume exists, only fallback when no resume record
        const resumeUrl = resume && resume.value ? resume.value : '/Jumawan-Resume-UPDATED.png';

        const profileImage = data?.find((item: HeroSetting) => item.type === 'profile_image');
        // Use actual value (even if empty) when profile_image exists, only fallback when no record
        const profileImageUrl = profileImage && profileImage.value ? profileImage.value : '/placeholder.svg';

        set({
            badges: badgeValues.length > 0 ? badgeValues : ['BSIT Student', 'Full Stack Developer', 'Freelancer'],
            resumeUrl,
            profileImageUrl,
            loading: false,
        });
    },
}));

