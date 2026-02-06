import { create } from 'zustand';
import { supabase, Certificate } from '@/lib/supabase';

interface CertificateState {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
  fetchCertificates: () => Promise<void>;
}

export const useCertificateStore = create<CertificateState>((set) => ({
  certificates: [],
  loading: false,
  error: null,
  fetchCertificates: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      set({ certificates: data || [] });
    } catch (error) {
      console.error('Error fetching certificates:', error);
      set({ error: (error as Error).message || 'An unknown error occurred' });
    } finally {
      set({ loading: false });
    }
  },
}));
