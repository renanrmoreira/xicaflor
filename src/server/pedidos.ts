import "server-only";
import { exigirAdmin } from "./auth";
import { supabaseServidor, urlDaFoto } from "./supabase";

const ITENS =
	"itens:itens_pedido(id, nome_produto, cor, tamanho, preco_unitario_centavos, quantidade, variante:variantes(estoque, produto:produtos(produto_fotos(path_miniatura, ordem))))";

export const ITENS_CLIENTE =
	"itens:itens_pedido(id, nome_produto, cor, tamanho, preco_unitario_centavos, quantidade, variante:variantes(produto:produtos(produto_fotos(path_miniatura, ordem))))";

export function fotosDosItens<
	T extends {
		variante: {
			produto: {
				produto_fotos: { path_miniatura: string; ordem: number }[];
			} | null;
		} | null;
	},
>(itens: T[]) {
	return itens.map(({ variante, ...item }) => ({
		...item,
		foto: capa(variante?.produto?.produto_fotos),
	}));
}

type ItemBruto = {
	variante: {
		estoque: number;
		produto: {
			produto_fotos: { path_miniatura: string; ordem: number }[];
		} | null;
	} | null;
};

function capa(fotos: { path_miniatura: string; ordem: number }[] | undefined) {
	const primeira = fotos?.toSorted((a, b) => a.ordem - b.ordem)[0];
	return primeira ? urlDaFoto(primeira.path_miniatura) : null;
}

function comFotos<T extends ItemBruto>(itens: T[]) {
	return itens.map(({ variante, ...item }) => ({
		...item,
		foto: capa(variante?.produto?.produto_fotos),
		estoque: variante?.estoque ?? null,
	}));
}

export async function pedidosDoAdmin(status?: readonly string[], limite = 100) {
	await exigirAdmin();
	let consulta = (await supabaseServidor())
		.from("pedidos")
		.select(
			`id, numero, status, modalidade, total_centavos, criado_em, cliente:perfis(nome), ${ITENS}`,
		)
		.order("criado_em", { ascending: false })
		.limit(limite);
	if (status) consulta = consulta.in("status", status);
	const { data, error } = await consulta;
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

type PainelVendas = {
	semana: { dia: string; centavos: number }[];
	mais_vendidos: { nome: string; quantidade: number }[];
};

export async function painelDoAdmin() {
	await exigirAdmin();
	const supabase = await supabaseServidor();
	const [vendas, estoque] = await Promise.all([
		supabase.rpc("painel_vendas"),
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
	]);
	if (vendas.error) throw vendas.error;
	if (estoque.error) throw estoque.error;
	const painel = vendas.data as PainelVendas;
	return {
		semana: painel.semana.map(({ dia, centavos }) => ({
			dia: new Date(`${dia}T12:00:00-03:00`).toLocaleDateString("pt-BR", {
				timeZone: "America/Belem",
				weekday: "short",
				day: "2-digit",
			}),
			centavos,
		})),
		maisVendidos: painel.mais_vendidos,
		estoqueBaixo: estoque.data.map((v) => ({
			...v,
			foto: capa(v.produto.produto_fotos),
		})),
	};
}
