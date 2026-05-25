// IMPORTANT: Import URL polyfill FIRST to fix protocol error
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://gspttfvwrmyfpdjozhpz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcHR0ZnZ3cm15ZnBkam96aHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTEyMTAsImV4cCI6MjA5NTI2NzIxMH0.O8n5EJkX07Y38Jq79VcN-DCuftj0iBt-eK7fL8eyOic';

// Create Supabase client with realtime disabled
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native',
    },
  },
});

// Export the client
export const supabase = supabaseClient;

// Supabase client initialized
