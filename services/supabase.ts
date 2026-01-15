
import { createClient } from '@supabase/supabase-js';

// These environment variables are assumed to be injected by the environment
const supabaseUrl = (process.env.SUPABASE_URL || 'https://dgyfjijqyorvsczqqdgz.supabase.co');
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRneWZqaWpxeW9ydnNjenFxZGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NDk3NzksImV4cCI6MjA4NDAyNTc3OX0.n5kAJmbwntYszDh9Vfv9JWoUb1VpKRlrvT1axAihQ2s');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
