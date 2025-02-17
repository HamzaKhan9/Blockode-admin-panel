import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase_database";

const PROD_SUPABASE_BASE_URL = "https://dxmteygfbfqfnzllymfe.supabase.co";
const PROD_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bXRleWdmYmZxZm56bGx5bWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2OTE5NjIsImV4cCI6MjA1MDI2Nzk2Mn0.20jLJwB3yigzqOT2rI0hitaNTDk70I2xZUwAF2SkhdMeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bXRleWdmYmZxZm56bGx5bWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2OTE5NjIsImV4cCI6MjA1MDI2Nzk2Mn0.20jLJwB3yigzqOT2rI0hitaNTDk70I2xZUwAF2SkhdM";
const DEV_SUPABASE_BASE_URL = "https://dxmteygfbfqfnzllymfe.supabase.co";
const DEV_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bXRleWdmYmZxZm56bGx5bWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2OTE5NjIsImV4cCI6MjA1MDI2Nzk2Mn0.20jLJwB3yigzqOT2rI0hitaNTDk70I2xZUwAF2SkhdM";
export const ENV = import.meta.env.VITE_APP_ENV;

const supabase = createClient<Database>(
  ENV == "prod" ? PROD_SUPABASE_BASE_URL : DEV_SUPABASE_BASE_URL,
  ENV == "prod" ? PROD_SUPABASE_KEY : DEV_SUPABASE_KEY
);
export default supabase;
