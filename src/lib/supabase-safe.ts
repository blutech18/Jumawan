import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseUrl !== 'your-supabase-url' && 
                             supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key'

// Create Supabase client with error handling
let supabaseClient: SupabaseClient | null = null

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'x-client-info': 'portfolio-app'
        }
      }
    })
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
  }
}

// Helper to check if error is a network error
const isNetworkError = (error: any): boolean => {
  if (!error) return false
  const message = error.message || error.toString() || ''
  return (
    message.includes('Failed to fetch') ||
    message.includes('ERR_NAME_NOT_RESOLVED') ||
    message.includes('NetworkError') ||
    message.includes('Network request failed') ||
    message.includes('ERR_INTERNET_DISCONNECTED') ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ENOTFOUND'
  )
}

// Retry logic with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delay = 1000
): Promise<T | null> => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (isNetworkError(error)) {
        if (i === maxRetries) {
          console.warn(`Max retries reached for Supabase operation`)
          return null
        }
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
        continue
      }
      // Non-network errors, throw immediately
      throw error
    }
  }
  return null
}

// Safe Supabase wrapper
export const safeSupabase = {
  get client(): SupabaseClient | null {
    return supabaseClient
  },

  isAvailable(): boolean {
    return isSupabaseConfigured && supabaseClient !== null
  },

  // Safe query wrapper
  async safeQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
    fallback: T | null = null
  ): Promise<{ data: T | null; error: null }> {
    if (!this.isAvailable()) {
      return { data: fallback, error: null }
    }

    try {
      const result = await retryWithBackoff(() => queryFn(supabaseClient!))
      
      if (result === null) {
        return { data: fallback, error: null }
      }

      if (result.error && isNetworkError(result.error)) {
        console.warn('Network error in Supabase query, using fallback')
        return { data: fallback, error: null }
      }

      return { data: result.data || fallback, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('Network error in Supabase query, using fallback')
        return { data: fallback, error: null }
      }
      console.error('Unexpected error in Supabase query:', error)
      return { data: fallback, error: null }
    }
  },

  // Safe realtime subscription wrapper
  safeSubscribe(
    channelName: string,
    callback: (payload: any) => void,
    config: { event: string; schema: string; table: string }
  ): () => void {
    if (!this.isAvailable()) {
      // Return no-op unsubscribe function
      return () => {}
    }

    try {
      const channel = supabaseClient!
        .channel(channelName, {
          config: {
            // Disable automatic reconnection to prevent error spam
            reconnect: false,
          }
        })
        .on('postgres_changes', config, callback)
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // Successfully subscribed - no log needed
          } else if (status === 'CHANNEL_ERROR') {
            // Silently handle channel errors - don't spam console
          } else if (status === 'TIMED_OUT') {
            // Silently handle timeouts
          } else if (status === 'CLOSED') {
            // Channel closed - normal behavior
          }
        })

      return () => {
        try {
          if (supabaseClient && channel) {
            supabaseClient.removeChannel(channel)
          }
        } catch (error) {
          // Silently handle cleanup errors
        }
      }
    } catch (error) {
      // Silently handle subscription errors - app continues without realtime
      return () => {}
    }
  }
}

// Export the original client for backward compatibility (but prefer safeSupabase)
export const supabase = supabaseClient || ({} as SupabaseClient)

// Re-export types
export type { SupabaseClient }
