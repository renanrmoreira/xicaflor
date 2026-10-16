import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormProduto } from "@/components/admin/form-produto";
import { textoDeCentavos } from "@/lib/dinheiro";
import { salvarProduto } from "@/server/acoes-produtos";
import { arvoreDeCategorias, produtoParaEdicao } from "@/server/catalogo";

export const metadata: Metadata = { title: "Editar produto — Admin Xica Flor" };

export default async function Page({
	params,
}: PageProps<"/admin/produtos/[id]">) {
	const { id } = await params;
	const [produto, categorias] = await Promise.all([
		/^[0-9a-f-]{36}$/.test(id) ? produtoParaEdicao(id) : null,
		arvoreDeCategorias(),
	]);
	if (!produto) notFound();
	return (
		<>
			<h1 className="display mb-8 text-head">Editar produto</h1>
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
		</>
	);
}
