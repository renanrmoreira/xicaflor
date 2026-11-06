import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcoesPedido } from "@/components/admin/acoes-pedido";
import { ResumoPedido } from "@/components/pedido/resumo-pedido";
import { classeBotao } from "@/components/ui/botao";
import { linkWhatsapp, whatsappDoCliente } from "@/lib/loja";
import { cancelavel, proximoStatus, rotuloStatus } from "@/lib/pedido";
import { mudarStatus } from "@/server/acoes-pedido";
import { pedidoDoAdmin } from "@/server/pedidos";

export const metadata: Metadata = { title: "Pedido — Admin Xica Flor" };

type Endereco = Partial<
	Record<
		"logradouro" | "numero" | "complemento" | "bairro" | "cidade" | "cep",
		string
	>
>;

export default async function Page({
	params,
}: PageProps<"/admin/pedidos/[id]">) {
	const { id } = await params;
	if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
	const pedido = await pedidoDoAdmin(id);
	if (!pedido) notFound();

	const endereco = pedido.endereco as Endereco | null;
	const nome = pedido.cliente?.nome ?? "";
	const whatsapp = whatsappDoCliente(pedido.cliente?.telefone ?? null);
	const saudacao = nome ? `, ${nome.split(" ")[0]}` : "";
	const mensagem = `Olá${saudacao}! Aqui é da Xica Flor, sobre o seu pedido nº ${pedido.numero}.`;

	const quando = (data: string | null) =>
		data &&
		new Date(data).toLocaleString("pt-BR", {
			timeZone: "America/Belem",
			dateStyle: "short",
			timeStyle: "short",
		});

	return (
		<section className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<Link
					href="/admin/pedidos"
					className="text-small underline underline-offset-4"
				>
					Todos os pedidos
				</Link>
				<p className="text-small text-suave">
					Pedido nº {pedido.numero} · feito em {quando(pedido.criado_em)}
					{pedido.pago_em && ` · pago em ${quando(pedido.pago_em)}`}
				</p>
				<h1 className="display text-head">{rotuloStatus(pedido.status)}</h1>
			</div>

			<div className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
				<div className="flex flex-col gap-4">
					<h2 className="font-semibold">Peças do pedido</h2>
					<ResumoPedido pedido={pedido} />
				</div>

				<aside className="flex flex-col gap-6 border border-linha p-5">
					<AcoesPedido
						proximo={proximoStatus(pedido.status, pedido.modalidade)}
						cancelavel={cancelavel(pedido.status)}
						mudar={mudarStatus.bind(null, pedido.id)}
					/>
					<div className="flex flex-col gap-2">
						<h2 className="text-small font-semibold text-suave">Cliente</h2>
						<p className="text-lead">{nome || "Cliente"}</p>
						{pedido.cliente?.telefone && (
							<p className="text-suave">WhatsApp {pedido.cliente.telefone}</p>
						)}
					</div>
					<div className="flex flex-col gap-2">
						<h2 className="text-small font-semibold text-suave">
							{endereco ? "Entrega" : "Retirada"}
						</h2>
						{endereco ? (
							<p>
								{endereco.logradouro}, {endereco.numero}
								{endereco.complemento && ` · ${endereco.complemento}`}
								<br />
								{endereco.bairro && `${endereco.bairro} · `}
								{endereco.cidade} · CEP {endereco.cep}
							</p>
						) : (
							<p>Retirada na loja</p>
						)}
					</div>
					{whatsapp ? (
						<a
							href={linkWhatsapp(mensagem, whatsapp)}
							target="_blank"
							rel="noopener noreferrer"
							className={classeBotao("secundario")}
						>
							Chamar no WhatsApp
						</a>
					) : (
						<p className="text-small text-suave">
							Cliente sem WhatsApp no cadastro.
						</p>
					)}
				</aside>
			</div>
		</section>
	);
}
