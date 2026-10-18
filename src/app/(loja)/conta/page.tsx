import type { Metadata } from "next";
import Link from "next/link";
import { FormPerfil } from "@/components/conta/form-perfil";
import { Botao, classeBotao } from "@/components/ui/botao";
import { formatarReais } from "@/lib/dinheiro";
import { rotuloStatus } from "@/lib/pedido";
import { sair } from "@/server/acoes-auth";
import { salvarPerfil } from "@/server/acoes-conta";
import { exigirCliente, listarPedidos } from "@/server/cliente";

export const metadata: Metadata = {
	title: "Minha conta — Xica Flor",
	robots: { index: false },
};

export default async function Page() {
	const { id, email, perfil } = await exigirCliente();
	const { data: pedidos, error } = await listarPedidos(id);
	return (
		<section className="flex flex-col gap-8 px-(--margem) pt-10">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-col gap-2">
					<h1 className="display text-head">Minha conta</h1>
					<p className="text-suave">{email}</p>
				</div>
				<form action={sair.bind(null, "/entrar")}>
					<Botao type="submit" variante="fantasma" className="-mr-6">
						Sair
					</Botao>
				</form>
			</div>
			<section aria-labelledby="meus-pedidos" className="flex flex-col gap-4">
				<h2 id="meus-pedidos" className="display text-lead">
					Meus pedidos
				</h2>
				{error ? (
					<p role="alert">
						Não deu para carregar seus pedidos. Recarregue a página.
					</p>
				) : pedidos.length === 0 ? (
					<div className="flex flex-col items-start gap-3">
						<p className="text-suave">Você ainda não fez nenhum pedido.</p>
						<Link href="/" className={classeBotao("secundario")}>
							Ver a loja
						</Link>
					</div>
				) : (
					<ul className="flex flex-col divide-y divide-linha border-y border-linha">
						{pedidos.map((p) => (
							<li key={p.id}>
								<Link
									href={`/pedido/${p.id}`}
									className="flex min-h-11 items-center justify-between gap-4 py-3"
								>
									<span>
										Pedido nº {p.numero}
										<span className="block text-small text-suave">
											{new Date(p.criado_em).toLocaleDateString("pt-BR", {
												timeZone: "America/Belem",
											})}{" "}
											· {rotuloStatus(p.status)}
										</span>
									</span>
									<span className="shrink-0">
										{formatarReais(p.total_centavos ?? 0)}
									</span>
								</Link>
							</li>
						))}
					</ul>
				)}
			</section>
			<FormPerfil inicial={perfil} acao={salvarPerfil} />
		</section>
	);
}
