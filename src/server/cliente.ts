import "server-only";
import { redirect } from "next/navigation";
import { supabaseServidor } from "./supabase";

export async function exigirCliente() {
	const supabase = await supabaseServidor();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/entrar");
	const { data: perfil, error } = await supabase
		.from("perfis")
		.select(
			"nome, telefone, cep, logradouro, numero, complemento, bairro, cidade, uf",
		)
		.eq("id", user.id)
		.single();
	if (error) throw error;
	return { id: user.id, email: user.email ?? "", perfil };
}
