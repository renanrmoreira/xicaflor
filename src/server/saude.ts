import "server-only";

export async function bancoRespondendo(): Promise<boolean> {
	const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/health`, {
		method: "POST",
		headers: {
			apikey: process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
			"content-type": "application/json",
		},
		body: "{}",
		cache: "no-store",
	});
	return res.ok && (await res.json()) === true;
}
