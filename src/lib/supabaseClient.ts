// import "../../envConfig";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/types";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANONKEY ?? "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
