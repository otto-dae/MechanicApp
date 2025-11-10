import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config()

const DB = createClient(process.env.DB_URL, process.env.DB_KEY);

export {DB}