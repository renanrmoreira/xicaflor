import "server-only";
import { notFound, redirect } from "next/navigation";
import { supabaseServidor } from "./supabase";

export async function exigirAdmin() {
	const supabase = await supabaseServidor();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/admin/entrar");
	const { data: admin } = await supabase.rpc("is_admin");
	if (!admin) notFound();
	const { data: perfil } = await supabase
		.from("perfis")
		.select("nome")
		.eq("id", user.id)
		.single();
	return { id: user.id, nome: perfil?.nome ?? user.email ?? "" };
}
