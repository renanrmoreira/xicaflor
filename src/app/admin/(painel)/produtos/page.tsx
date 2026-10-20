import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListaProdutos } from "@/components/admin/lista-produtos";
import { classeBotao } from "@/components/ui/botao";
import { termoDeBusca } from "@/lib/loja";
import { ajustarEstoque, alternarProduto } from "@/server/acoes-produtos";
import { POR_PAGINA, produtosDoAdmin } from "@/server/catalogo";

export const metadata: Metadata = { title: "Produtos — Admin Xica Flor" };

export default async function Page({
	searchParams,
}: PageProps<"/admin/produtos">) {
	const { q, p } = await searchParams;
	const termo = termoDeBusca(q);
	const pagina = Math.max(
		1,
		Number.parseInt(String(Array.isArray(p) ? p[0] : (p ?? "1")), 10) || 1,
	);
	const { produtos, total } = await produtosDoAdmin(termo, pagina);
	const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
	const link = (n: number) =>
		`/admin/produtos?${new URLSearchParams({ ...(termo && { q: termo }), p: String(n) })}`;
	if (pagina > paginas) redirect(link(1));
	return (
		<>
			<div className="mb-6 flex flex-wrap items-end justify-between gap-4">
				<h1 className="display text-head">Produtos</h1>
				<Link href="/admin/produtos/novo" className={classeBotao()}>
					Novo produto
				</Link>
			</div>
			<form action="/admin/produtos" className="mb-6 flex max-w-md gap-2">
				<label htmlFor="busca-produtos" className="sr-only">
					Buscar produto pelo nome
				</label>
				<input
					id="busca-produtos"
					name="q"
					type="search"
					defaultValue={termo ?? ""}
					placeholder="Buscar pelo nome"
					className="min-h-11 w-full min-w-0 border border-linha bg-papel px-3.5 focus:border-tinta"
				/>
				<button type="submit" className={classeBotao("secundario")}>
					Buscar
				</button>
			</form>
			{termo && (
				<p className="mb-4 text-small text-suave">
					{total} {total === 1 ? "resultado" : "resultados"} para “{termo}”.{" "}
					<Link href="/admin/produtos" className="underline underline-offset-4">
						Limpar busca
					</Link>
				</p>
			)}
			{termo && total === 0 ? (
				<p className="border-y border-linha py-6 text-suave">
					Nenhum produto encontrado.
				</p>
			) : (
				<ListaProdutos
					produtos={produtos}
					ajustar={ajustarEstoque}
					alternar={alternarProduto}
				/>
			)}
			{paginas > 1 && (
				<nav
					aria-label="Páginas"
					className="mt-6 flex items-center justify-between gap-4"
				>
					{pagina > 1 ? (
						<Link href={link(pagina - 1)} className={classeBotao("secundario")}>
							Anteriores
						</Link>
					) : (
						<span />
					)}
					<span className="text-small text-suave">
						Página {pagina} de {paginas}
					</span>
					{pagina < paginas ? (
						<Link href={link(pagina + 1)} className={classeBotao("secundario")}>
							Próximos
						</Link>
					) : (
						<span />
					)}
				</nav>
			)}
		</>
	);
}
