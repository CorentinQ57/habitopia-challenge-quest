
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://haodastqykbgflafrlfn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhb2Rhc3RxeWtiZ2ZsYWZybGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyOTUyNjUsImV4cCI6MjA1MDg3MTI2NX0.C61uN26D75rf_rA7x1INOQLIVm4X2GidC8DtREWy6eY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'auth-store',
    storage: window.localStorage,
    autoRefreshToken: true,
  },
});
