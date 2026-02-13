import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
    profileImageUrl: '/me.jpg', // Default fallback
    loading: false,
    error: null,

    fetchSettings: async () => {
        try {
            set({ loading: true, error: null });

            const { data, error } = await supabase
                .from('hero_settings')
                .select('*')
                .eq('is_active', true)
                .order('order_index', { ascending: true });

            if (error) {
                console.error('Error fetching hero settings:', error);
                // Keep default values on error
                set({ loading: false, error: error.message });
                return;
            }

            const badgeValues = data
                ?.filter((item: HeroSetting) => item.type === 'badge')
                .map((item: HeroSetting) => item.value) || [];

            const resume = data?.find((item: HeroSetting) => item.type === 'resume');
            // Use actual value (even if empty) when resume exists, only fallback when no resume record
            const resumeUrl = resume ? resume.value : '/Jumawan-Resume-UPDATED.png';

            const profileImage = data?.find((item: HeroSetting) => item.type === 'profile_image');
            // Use actual value (even if empty) when profile_image exists, only fallback when no record
            const profileImageUrl = profileImage ? profileImage.value : '/me.jpg';

            set({
                badges: badgeValues.length > 0 ? badgeValues : ['BSIT Student', 'Full Stack Developer', 'Freelancer'],
                resumeUrl,
                profileImageUrl,
                loading: false,
            });
        } catch (err) {
            console.error('Unexpected error fetching hero settings:', err);
            set({ loading: false, error: 'Failed to load hero settings' });
        }
    },
}));

