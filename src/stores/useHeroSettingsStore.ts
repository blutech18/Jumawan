import { create } from 'zustand';
import { convexClient } from '@/lib/convexClient';
import { api } from '../../convex/_generated/api';

export interface HeroSetting {
    _id: string;
    id: string;
    type: 'badge' | 'resume' | 'profile_image' | 'hover_logo';
    value: string;
    order_index: number;
    is_active: boolean;
    _creationTime: number;
}

interface HeroSettingsState {
    badges: string[];
    resumeUrl: string;
    profileImageUrl: string;
    hoverLogoUrl: string;
    loading: boolean;
    error: string | null;
    fetchSettings: () => Promise<void>;
}

export const useHeroSettingsStore = create<HeroSettingsState>((set) => ({
    badges: [],
    resumeUrl: '', // Set via Convex admin, or add a file under public/ and use /filename.ext
    profileImageUrl: '/placeholder.svg', // Default fallback
    hoverLogoUrl: '', // Default fallback - no hover logo
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
            const resumeUrl = resume && resume.value ? resume.value : '';

            const profileImage = data?.find((item: any) => item.type === 'profile_image');
            const profileImageUrl = profileImage && profileImage.value ? profileImage.value : '/placeholder.svg';

            const hoverLogo = data?.find((item: any) => item.type === 'hover_logo');
            const hoverLogoUrl = hoverLogo && hoverLogo.value ? hoverLogo.value : '';

            set({
                badges: badgeValues.length > 0 ? badgeValues : ['BSIT Student', 'Full Stack Developer', 'Freelancer'],
                resumeUrl,
                profileImageUrl,
                hoverLogoUrl,
                loading: false,
            });
        } catch (error) {
            console.warn('Failed to fetch hero settings:', error);
            set({ loading: false });
        }
    },
}));

