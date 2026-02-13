import { create } from 'zustand';
import { safeSupabase } from '@/lib/supabase-safe';

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
    
    if (!safeSupabase.isAvailable()) {
      console.warn('Supabase not available, cannot submit form');
      set({ submitStatus: 'error', isSubmitting: false });
      return false;
    }

    try {
      const { error } = await safeSupabase.client!
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: 'unread'
        }]);

      if (error) throw error;
      
      // Also track analytics (non-blocking, don't fail if this fails)
      try {
        await safeSupabase.client!
          .from('analytics')
          .insert([{
            event_type: 'contact_form_submission',
            page_url: '/contact',
            event_data: { subject: formData.subject }
          }]);
      } catch (analyticsError) {
        // Analytics failure shouldn't block form submission
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
