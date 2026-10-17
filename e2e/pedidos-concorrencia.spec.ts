import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? "";
const servico = createClient(url, process.env.SUPABASE_SECRET_KEY ?? "");

async function clienteLogado(email: string) {
	await servico.auth.admin.createUser({
		email,
		password: "senha-teste-123",
		email_confirm: true,
	});
	const cliente = createClient(
		url,
		process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
		{
			auth: { persistSession: false },
		},
	);
	const { error } = await cliente.auth.signInWithPassword({
		email,
		password: "senha-teste-123",
	});
	if (error) throw error;
	return cliente;
}

async function varianteCom(estoque: number, sufixo: string) {
	const { data: categoria } = await servico
		.from("categorias")
		.select("id")
		.eq("slug", "vestidos-e2e")
		.single();
	const { data: produto } = await servico
		.from("produtos")
		.insert({
			nome: `Concorrência ${sufixo}`,
			slug: `concorrencia-${sufixo}`,
			categoria_id: categoria?.id ?? "",
		})
		.select("id")
		.single();
	const { data: variante } = await servico
		.from("variantes")
		.insert({
			produto_id: produto?.id ?? "",
			tamanho: "U",
			preco_centavos: 5000,
			estoque,
		})
		.select("id")
		.single();
	return variante?.id ?? "";
}

const pedir = (
	cliente: Awaited<ReturnType<typeof clienteLogado>>,
	varianteId: string,
) =>
	cliente.rpc("criar_pedido", {
		itens: [{ variante_id: varianteId, quantidade: 1 }],
		modalidade: "retirada",
	});

// biome-ignore lint/correctness/noEmptyPattern: o Playwright exige desestruturar as fixtures
test("duas clientes pela última peça: exatamente um pedido sai", async ({}, info) => {
	const sufixo = `${info.project.name}-${Date.now()}`;
	const [ana, bia] = await Promise.all([
		clienteLogado(`ana-${sufixo}@e2e.local`),
		clienteLogado(`bia-${sufixo}@e2e.local`),
	]);
	const variante = await varianteCom(1, sufixo);

	const resultados = await Promise.all([
		pedir(ana, variante),
		pedir(bia, variante),
	]);
	expect(resultados.filter((r) => !r.error)).toHaveLength(1);
	expect(resultados.find((r) => r.error)?.error?.code).toBe("P0001");

	const { data } = await servico
		.from("variantes")
		.select("estoque")
		.eq("id", variante)
		.single();
	expect(data?.estoque).toBe(0);
});

// biome-ignore lint/correctness/noEmptyPattern: o Playwright exige desestruturar as fixtures
test("vinte pedidos simultâneos para dez peças: dez saem e o estoque zera", async ({}, info) => {
	const sufixo = `${info.project.name}-${Date.now()}-lote`;
	const clientes = await Promise.all(
		Array.from({ length: 20 }, (_, i) =>
			clienteLogado(`lote-${i}-${sufixo}@e2e.local`),
		),
	);
	const variante = await varianteCom(10, sufixo);

	const resultados = await Promise.all(clientes.map((c) => pedir(c, variante)));
	expect(resultados.filter((r) => !r.error)).toHaveLength(10);

	const { data } = await servico
		.from("variantes")
		.select("estoque")
		.eq("id", variante)
		.single();
	expect(data?.estoque).toBe(0);
});
