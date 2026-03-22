import { create } from 'zustand';
import { convexClient } from '@/lib/convexClient';
import { api } from '../../convex/_generated/api';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactState {
  isSubmitting: boolean;
  submitStatus: 'idle' | 'success' | 'error';
  submitMessage: (data: ContactFormData) => Promise<boolean>;
  resetStatus: () => void;
}

export const useContactStore = create<ContactState>((set) => ({
  isSubmitting: false,
  submitStatus: 'idle',
  resetStatus: () => set({ submitStatus: 'idle' }),
  submitMessage: async (formData: ContactFormData) => {
    set({ isSubmitting: true, submitStatus: 'idle' });

    try {
      await convexClient.mutation(api.contactMessages.create, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'unread' as const,
      });
      
      // Also track analytics (non-blocking)
      try {
        await convexClient.mutation(api.analytics.track, {
          event_type: 'contact_form_submission',
          page_url: '/contact',
          event_data: { subject: formData.subject },
        });
      } catch (analyticsError) {
        console.warn('Failed to track analytics:', analyticsError);
      }

      set({ submitStatus: 'success', isSubmitting: false });
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      set({ submitStatus: 'error', isSubmitting: false });
      return false;
    }
  },
}));
