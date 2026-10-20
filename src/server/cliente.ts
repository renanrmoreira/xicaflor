import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServidor } from "./supabase";

export async function exigirCliente(volta?: "/checkout") {
	const supabase = await supabaseServidor();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect(volta ? `/entrar?volta=${volta}` : "/entrar");
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

export async function listarPedidos(clienteId: string) {
	return (await supabaseServidor())
		.from("pedidos")
		.select("id, numero, status, total_centavos, criado_em")
		.eq("cliente_id", clienteId)
		.order("criado_em", { ascending: false })
		.limit(50);
}

export const RECUPERACAO = "recuperacao_senha";

export async function exigirRecuperacao() {
	const cliente = await exigirCliente();
	if (!(await cookies()).has(RECUPERACAO)) redirect("/conta");
	return cliente;
}
