import type { Metadata } from "next";
import Link from "next/link";
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
			<header className="sticky top-0 z-40 flex items-center justify-between bg-amarelo px-(--margem) py-3 text-vermelho">
				<Link href="/admin" aria-label="Início do admin">
					<Wordmark className="w-24" />
				</Link>
				<div className="flex items-center gap-3 text-small text-bordo">
					<span className="hidden sm:inline">{admin.nome}</span>
					<form action={sair}>
						<button
							type="submit"
							className="botao min-h-11 px-3 font-semibold underline-offset-4 hover:underline"
						>
							Sair
						</button>
					</form>
				</div>
			</header>
			<main className="flex-1 px-(--margem) py-8">{children}</main>
		</div>
	);
}
