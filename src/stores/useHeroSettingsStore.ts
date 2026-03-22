import { create } from 'zustand';
import { convexClient } from '@/lib/convexClient';
import { api } from '../../convex/_generated/api';

export interface HeroSetting {
    _id: string;
    id: string;
    type: 'badge' | 'resume' | 'profile_image';
    value: string;
    order_index: number;
    is_active: boolean;
    _creationTime: number;
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
    profileImageUrl: '/placeholder.svg', // Default fallback
    loading: false,
    error: null,

    fetchSettings: async () => {
        set({ loading: true, error: null });
        try {
            const data = await convexClient.query(api.heroSettings.listActive);

            const badgeValues = data
                ?.filter((item: any) => item.type === 'badge')
                .map((item: any) => item.value) || [];

            const resume = data?.find((item: any) => item.type === 'resume');
            const resumeUrl = resume && resume.value ? resume.value : '/Jumawan-Resume-UPDATED.png';

            const profileImage = data?.find((item: any) => item.type === 'profile_image');
            const profileImageUrl = profileImage && profileImage.value ? profileImage.value : '/placeholder.svg';

            set({
                badges: badgeValues.length > 0 ? badgeValues : ['BSIT Student', 'Full Stack Developer', 'Freelancer'],
                resumeUrl,
                profileImageUrl,
                loading: false,
            });
        } catch (error) {
            console.warn('Failed to fetch hero settings:', error);
            set({ loading: false });
        }
    },
}));

