import type { Metadata } from "next";
import Link from "next/link";
import { ListaProdutos } from "@/components/admin/lista-produtos";
import { ajustarEstoque, alternarProduto } from "@/server/acoes-produtos";
import { produtosDoAdmin } from "@/server/catalogo";

export const metadata: Metadata = { title: "Produtos — Admin Xica Flor" };

export default async function Page() {
	const produtos = await produtosDoAdmin();
	return (
		<>
			<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
				<h1 className="display text-head">Produtos</h1>
				<Link
					href="/admin/produtos/novo"
					className="botao bg-vermelho text-papel hover:bg-bordo"
				>
					Novo produto
				</Link>
			</div>
			<ListaProdutos
				produtos={produtos}
				ajustar={ajustarEstoque}
				alternar={alternarProduto}
			/>
		</>
	);
}
