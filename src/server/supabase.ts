import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

export async function supabaseServidor() {
	const loja = await cookies();
	return createServerClient<Database>(
		process.env.SUPABASE_URL ?? "",
		process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
		{
			cookies: {
				getAll: () => loja.getAll(),
				setAll: (lista) => {
					try {
						for (const { name, value, options } of lista)
							loja.set(name, value, options);
					} catch {
						// Server Components não gravam cookies; o proxy renova a sessão antes da renderização.
					}
				},
			},
		},
	);
}

export function supabasePublico() {
	return createClient<Database>(
		process.env.SUPABASE_URL ?? "",
		process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
		{
			auth: { persistSession: false, autoRefreshToken: false },
		},
	);
}
