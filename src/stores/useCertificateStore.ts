import { create } from 'zustand';
import { Certificate } from '@/lib/supabase';
import { safeSupabase } from '@/lib/supabase-safe';

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
    
    const { data } = await safeSupabase.safeQuery<Certificate[]>(
      async (client) => {
        return await client
          .from('certificates')
          .select('*')
          .order('order_index', { ascending: true });
      },
      [] // Fallback to empty array
    );

    set({ certificates: data || [], loading: false });
  },

  subscribeToChanges: () => {
    return safeSupabase.safeSubscribe(
      'certificates-realtime',
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
      },
      { event: '*', schema: 'public', table: 'certificates' }
    );
  },
}));
