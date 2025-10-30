import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import { SUPABASE_API_KEY } from '@env';

const supabaseUrl = 'https://tiapdsojkbqjucmjmjri.supabase.co';
const supabaseAnonKey = SUPABASE_API_KEY;

export default createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
