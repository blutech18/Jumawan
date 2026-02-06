import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: 'unread'
        }]);

      if (error) throw error;
      
      // Also track analytics
      await supabase
        .from('analytics')
        .insert([{
          event_type: 'contact_form_submission',
          page_url: '/contact',
          event_data: { subject: formData.subject }
        }]);

      set({ submitStatus: 'success' });
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      set({ submitStatus: 'error' });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
