import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormProduto } from "@/components/admin/form-produto";
import { FotosProduto } from "@/components/admin/fotos-produto";
import { textoDeCentavos } from "@/lib/dinheiro";
import {
	excluirFoto,
	moverFoto,
	prepararEnvio,
	registrarFoto,
} from "@/server/acoes-fotos";
import { salvarProduto } from "@/server/acoes-produtos";
import {
	arvoreDeCategorias,
	fotosDoProduto,
	produtoParaEdicao,
} from "@/server/catalogo";

export const metadata: Metadata = { title: "Editar produto — Admin Xica Flor" };

export default async function Page({
	params,
}: PageProps<"/admin/produtos/[id]">) {
	const { id } = await params;
	if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
	const [produto, categorias, fotos] = await Promise.all([
		produtoParaEdicao(id),
		arvoreDeCategorias(),
		fotosDoProduto(id),
	]);
	if (!produto) notFound();
	return (
		<div className="flex flex-col gap-12">
			<h1 className="display text-head">Editar produto</h1>
			<FotosProduto
				produtoId={produto.id}
				nomeProduto={produto.nome}
				chavePublica={process.env.SUPABASE_PUBLISHABLE_KEY ?? ""}
				fotos={fotos}
				acoes={{
					preparar: prepararEnvio,
					registrar: registrarFoto,
					mover: moverFoto,
					excluir: excluirFoto,
				}}
			/>
			<FormProduto
				categorias={categorias}
				acao={salvarProduto}
				inicial={{
					...produto,
					marca: produto.marca ?? "",
					variantes: produto.variantes.map((v) => ({
						id: v.id,
						cor: v.cor ?? "",
						tamanho: v.tamanho ?? "",
						preco: textoDeCentavos(v.preco_centavos),
						estoque: String(v.estoque),
					})),
				}}
			/>
		</div>
	);
}
