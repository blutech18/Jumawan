import { create } from 'zustand';
import { supabase, Certificate } from '@/lib/supabase';

interface CertificateState {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
  fetchCertificates: () => Promise<void>;
  subscribeToChanges: () => () => void;
}

export const useCertificateStore = create<CertificateState>((set, get) => ({
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

  subscribeToChanges: () => {
    const channel = supabase
      .channel('certificates-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'certificates' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          set((state) => {
            let updated = [...state.certificates];

            if (eventType === 'INSERT') {
              updated.push(newRecord as Certificate);
            } else if (eventType === 'UPDATE') {
              updated = updated.map((cert) =>
                cert.id === (newRecord as Certificate).id ? (newRecord as Certificate) : cert
              );
            } else if (eventType === 'DELETE') {
              updated = updated.filter((cert) => cert.id !== (oldRecord as Certificate).id);
            }

            // Sort by order_index
            updated.sort((a, b) => a.order_index - b.order_index);

            return { certificates: updated };
          });
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
