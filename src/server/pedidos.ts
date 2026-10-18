import "server-only";
import { exigirAdmin } from "./auth";
import { supabaseServidor } from "./supabase";

export async function pedidosDoAdmin(status: readonly string[]) {
	await exigirAdmin();
	const { data, error } = await (await supabaseServidor())
		.from("pedidos")
		.select(
			"id, numero, status, modalidade, total_centavos, criado_em, cliente:perfis(nome)",
		)
		.in("status", status)
		.order("criado_em", { ascending: false })
		.limit(100);
	if (error) throw error;
	return data;
}

export async function pedidoDoAdmin(id: string) {
	await exigirAdmin();
	const { data, error } = await (await supabaseServidor())
		.from("pedidos")
		.select(
			"id, numero, status, modalidade, frete_a_combinar, subtotal_centavos, frete_centavos, total_centavos, endereco, criado_em, cliente:perfis(nome, telefone), itens:itens_pedido(id, nome_produto, cor, tamanho, preco_unitario_centavos, quantidade)",
		)
		.eq("id", id)
		.maybeSingle();
	if (error) throw error;
	return data;
}

export type ResumoVendas = {
	dia_centavos: number;
	dia_pedidos: number;
	mes_centavos: number;
	mes_pedidos: number;
	pendentes: Record<string, number>;
};

export async function resumoVendas() {
	await exigirAdmin();
	const { data, error } = await (await supabaseServidor()).rpc("resumo_vendas");
	if (error) throw error;
	return data as ResumoVendas;
}
