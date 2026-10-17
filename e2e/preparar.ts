import { createClient } from "@supabase/supabase-js";
import { ADMIN, CLIENTE } from "./usuarios.ts";

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
	const cliente = data.users.find((u) => u.email === CLIENTE.email);
	await supabase
		.from("perfis")
		.update({
			nome: "Cliente E2E",
			cep: "66060000",
			logradouro: "Avenida Visconde de Souza Franco",
			numero: "100",
			bairro: "Umarizal",
			cidade: "Belém",
			uf: "PA",
		})
		.eq("id", cliente?.id ?? "");
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

	const categoria = async (slug: string) =>
		(await supabase.from("categorias").select("id").eq("slug", slug).single())
			.data?.id ?? "";
	await supabase
		.from("categorias")
		.update({ link_vitrine: "https://loja.exemplo.com/xicaflor" })
		.eq("slug", "beleza");
	const { data: vestido } = await supabase
		.from("produtos")
		.upsert(
			{
				nome: "Vestido Loja E2E",
				slug: "vestido-loja-e2e",
				descricao: "Vestido midi em viscose.",
				categoria_id: await categoria("vestidos-e2e"),
				destaque: true,
			},
			{ onConflict: "slug" },
		)
		.select("id")
		.single();
	await supabase.from("variantes").upsert(
		[
			["G", 1],
			["P", 0],
			["M", 2],
		].map(([tamanho, estoque]) => ({
			produto_id: vestido?.id ?? "",
			cor: "Azul",
			tamanho: String(tamanho),
			estoque: Number(estoque),
			preco_centavos: 18990,
			ativo: true,
		})),
		{ onConflict: "produto_id,cor,tamanho" },
	);
	const { data: blusa } = await supabase
		.from("produtos")
		.upsert(
			{
				nome: "Blusa Checkout E2E",
				slug: "blusa-checkout-e2e",
				categoria_id: await categoria("vestidos-e2e"),
			},
			{ onConflict: "slug" },
		)
		.select("id")
		.single();
	await supabase.from("variantes").upsert(
		["M", "G"].map((tamanho) => ({
			produto_id: blusa?.id ?? "",
			cor: "Rosa",
			tamanho,
			estoque: 50,
			preco_centavos: 9990,
			ativo: true,
		})),
		{ onConflict: "produto_id,cor,tamanho" },
	);
	await supabase.from("produtos").upsert(
		{
			nome: "Batom Loja E2E",
			slug: "batom-loja-e2e",
			marca: "O.Lab",
			categoria_id: await categoria("maquiagem"),
		},
		{ onConflict: "slug" },
	);
}
