import type { Metadata } from "next";
import Link from "next/link";
import { LinkNav } from "@/components/ui/link-nav";
import { Wordmark } from "@/components/ui/marca";
import { sair } from "@/server/acoes-auth";
import { exigirAdmin } from "@/server/auth";

export const metadata: Metadata = {
	title: "Admin Xica Flor",
	robots: { index: false },
};

export default async function Layout({ children }: LayoutProps<"/admin">) {
	const admin = await exigirAdmin();
	return (
		<div className="flex flex-1 flex-col">
			<a
				href="#conteudo"
				className="sr-only z-50 bg-amarelo px-4 py-3 font-semibold text-bordo focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
			>
				Pular para o conteúdo
			</a>
			<header className="sticky top-0 z-40 flex items-center justify-between bg-amarelo px-(--margem) py-3 text-vermelho">
				<Link href="/admin" aria-label="Início do admin">
					<Wordmark className="w-24" />
				</Link>
				<div className="flex items-center gap-3 text-small text-bordo">
					<span className="hidden sm:inline">{admin.nome}</span>
					<form action={sair.bind(null, "/admin/entrar")}>
						<button
							type="submit"
							className="botao min-h-11 px-3 font-semibold underline-offset-4 hover:underline"
						>
							Sair
						</button>
					</form>
				</div>
			</header>
			<nav
				aria-label="Admin"
				className="flex gap-6 overflow-x-auto border-b border-linha px-(--margem) text-small font-semibold whitespace-nowrap"
			>
				{[
					["/admin", "Painel"],
					["/admin/pedidos", "Pedidos"],
					["/admin/produtos", "Produtos"],
					["/admin/categorias", "Categorias"],
					["/admin/frete", "Frete"],
				].map(([href, rotulo]) => (
					<LinkNav
						key={href}
						href={href}
						className="py-3 underline-offset-8 hover:underline aria-[current=page]:underline"
					>
						{rotulo}
					</LinkNav>
				))}
			</nav>
			<main
				id="conteudo"
				tabIndex={-1}
				className="flex-1 px-(--margem) py-8 outline-none"
			>
				{children}
			</main>
		</div>
	);
}
