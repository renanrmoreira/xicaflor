import { createClient } from "@supabase/supabase-js";
import { ADMIN, CLIENTE } from "./usuarios";

export default async function preparar() {
	const supabase = createClient(
		process.env.SUPABASE_URL ?? "",
		process.env.SUPABASE_SECRET_KEY ?? "",
	);
	for (const u of [ADMIN, CLIENTE]) {
		const { error } = await supabase.auth.admin.createUser({
			email: u.email,
			password: u.senha,
			email_confirm: true,
		});
		if (error && error.code !== "email_exists") throw error;
	}
	const { data } = await supabase.auth.admin.listUsers();
	const admin = data.users.find((u) => u.email === ADMIN.email);
	const { error } = await supabase
		.from("perfis")
		.update({ papel: "admin" })
		.eq("id", admin?.id ?? "");
	if (error) throw error;
	const { data: moda } = await supabase
		.from("categorias")
		.select("id")
		.eq("slug", "moda")
		.single();
	await supabase
		.from("categorias")
		.upsert(
			{ nome: "Vestidos E2E", slug: "vestidos-e2e", parent_id: moda?.id },
			{ onConflict: "slug" },
		);
}
