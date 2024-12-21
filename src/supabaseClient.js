// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yyqugjxhmvdjsdlzuvlb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXVnanhobXZkanNkbHp1dmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTM0NDgsImV4cCI6MjA1MDIyOTQ0OH0._h2GZDyYR2Y4eyeusLt6D4ORYoA16gDJqEmPiDcguW8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
