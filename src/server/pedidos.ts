import "server-only";
import { exigirAdmin } from "./auth";
import { supabaseServidor, urlDaFoto } from "./supabase";

export const ITENS =
	"itens:itens_pedido(id, nome_produto, cor, tamanho, preco_unitario_centavos, quantidade, variante:variantes(estoque, produto:produtos(produto_fotos(path_miniatura, ordem))))";

type ItemBruto = {
	variante: {
		estoque: number;
		produto: {
			produto_fotos: { path_miniatura: string; ordem: number }[];
		} | null;
	} | null;
};

export function comFotos<T extends ItemBruto>(itens: T[]) {
	return itens.map(({ variante, ...item }) => {
		const capa = variante?.produto?.produto_fotos.toSorted(
			(a, b) => a.ordem - b.ordem,
		)[0];
		return {
			...item,
			foto: capa ? urlDaFoto(capa.path_miniatura) : null,
			estoque: variante?.estoque ?? null,
		};
	});
}

export async function pedidosDoAdmin(status: readonly string[], limite = 100) {
	await exigirAdmin();
	const { data, error } = await (await supabaseServidor())
		.from("pedidos")
		.select(
			`id, numero, status, modalidade, total_centavos, criado_em, cliente:perfis(nome), ${ITENS}`,
		)
		.in("status", status)
		.order("criado_em", { ascending: false })
		.limit(limite);
	if (error) throw error;
	return data.map((p) => ({ ...p, itens: comFotos(p.itens) }));
}

export async function pedidoDoAdmin(id: string) {
	await exigirAdmin();
	const { data, error } = await (await supabaseServidor())
		.from("pedidos")
		.select(
			`id, numero, status, modalidade, frete_a_combinar, subtotal_centavos, frete_centavos, total_centavos, endereco, criado_em, pago_em, cliente:perfis(nome, telefone), ${ITENS}`,
		)
		.eq("id", id)
		.maybeSingle();
	if (error) throw error;
	return data && { ...data, itens: comFotos(data.itens) };
}

type ResumoVendas = {
	dia_centavos: number;
	dia_pedidos: number;
	mes_centavos: number;
	mes_pedidos: number;
	por_status: Record<string, number>;
};

export async function resumoVendas() {
	await exigirAdmin();
	const { data, error } = await (await supabaseServidor()).rpc("resumo_vendas");
	if (error) throw error;
	return data as ResumoVendas;
}

const dias = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export async function painelDoAdmin() {
	await exigirAdmin();
	const supabase = await supabaseServidor();
	const [vendas, estoque, itens] = await Promise.all([
		supabase
			.from("pedidos")
			.select("pago_em, total_centavos")
			.not("status", "in", "(cancelado,expirado)")
			.gte("pago_em", dias(6.5)),
		supabase
			.from("variantes")
			.select(
				"id, cor, tamanho, estoque, produto:produtos!inner(id, nome, ativo, produto_fotos(path_miniatura, ordem))",
			)
			.eq("ativo", true)
			.eq("produtos.ativo", true)
			.lte("estoque", 1)
			.order("estoque")
			.limit(8),
		supabase
			.from("itens_pedido")
			.select("nome_produto, quantidade, pedido:pedidos!inner(status, pago_em)")
			.not("pedidos.status", "in", "(cancelado,expirado)")
			.gte("pedidos.pago_em", dias(30)),
	]);
	for (const r of [vendas, estoque, itens]) if (r.error) throw r.error;

	const porDia = new Map<string, number>();
	for (let i = 6; i >= 0; i--)
		porDia.set(diaBelem(new Date(Date.now() - i * 86_400_000)), 0);
	for (const v of vendas.data ?? []) {
		const dia = diaBelem(new Date(v.pago_em ?? ""));
		if (porDia.has(dia))
			porDia.set(dia, (porDia.get(dia) ?? 0) + (v.total_centavos ?? 0));
	}

	const vendidos = new Map<string, number>();
	for (const i of itens.data ?? [])
		vendidos.set(
			i.nome_produto,
			(vendidos.get(i.nome_produto) ?? 0) + i.quantidade,
		);

	return {
		semana: [...porDia].map(([dia, centavos]) => ({ dia, centavos })),
		estoqueBaixo: (estoque.data ?? []).map((v) => {
			const capa = v.produto.produto_fotos.toSorted(
				(a, b) => a.ordem - b.ordem,
			)[0];
			return {
				...v,
				foto: capa ? urlDaFoto(capa.path_miniatura) : null,
			};
		}),
		maisVendidos: [...vendidos]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([nome, quantidade]) => ({ nome, quantidade })),
	};
}

function diaBelem(data: Date) {
	return data.toLocaleDateString("pt-BR", {
		timeZone: "America/Belem",
		weekday: "short",
		day: "2-digit",
	});
}
