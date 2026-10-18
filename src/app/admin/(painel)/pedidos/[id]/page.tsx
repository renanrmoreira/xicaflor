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

	return (
		<section className="flex max-w-2xl flex-col gap-8">
			<div className="flex flex-col gap-2">
				<Link
					href="/admin/pedidos"
					className="text-small underline underline-offset-4"
				>
					Todos os pedidos
				</Link>
				<p className="text-small text-suave">Pedido nº {pedido.numero}</p>
				<h1 className="display text-head">{rotuloStatus(pedido.status)}</h1>
			</div>

			<AcoesPedido
				proximo={proximoStatus(pedido.status, pedido.modalidade)}
				cancelavel={cancelavel(pedido.status)}
				mudar={mudarStatus.bind(null, pedido.id)}
			/>

			<div className="flex flex-col gap-2">
				<h2 className="font-semibold">{nome || "Cliente"}</h2>
				{endereco ? (
					<p className="text-suave">
						{endereco.logradouro}, {endereco.numero}
						{endereco.complemento && ` · ${endereco.complemento}`}
						<br />
						{endereco.bairro && `${endereco.bairro} · `}
						{endereco.cidade} · CEP {endereco.cep}
					</p>
				) : (
					<p className="text-suave">Retirada na loja</p>
				)}
				{whatsapp ? (
					<a
						href={linkWhatsapp(
							`Olá${nome ? `, ${nome.split(" ")[0]}` : ""}! Aqui é da Xica Flor, sobre o seu pedido nº ${pedido.numero}.`,
							whatsapp,
						)}
						target="_blank"
						rel="noopener"
						className={`${classeBotao("secundario")} self-start`}
					>
						Chamar no WhatsApp
					</a>
				) : (
					<p className="text-small text-suave">
						Cliente sem WhatsApp no cadastro.
					</p>
				)}
			</div>

			<ResumoPedido pedido={pedido} />
		</section>
	);
}
