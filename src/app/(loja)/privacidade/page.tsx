import type { Metadata } from "next";
import { PaginaTexto } from "@/components/loja/pagina-texto";
import { INSTAGRAM, linkWhatsapp } from "@/lib/loja";

export const metadata: Metadata = {
	title: "Política de privacidade — Xica Flor",
	alternates: { canonical: "/privacidade" },
};

export default function Page() {
	return (
		<PaginaTexto titulo="Privacidade">
			<p>
				Esta política explica quais dados a Xica Flor coleta, por que e como
				você controla esses dados, conforme a Lei Geral de Proteção de Dados
				(Lei 13.709/2018).
			</p>
			<h2>Quais dados coletamos</h2>
			<ul>
				<li>
					Cadastro: nome, e-mail, WhatsApp e senha (guardada de forma
					criptografada).
				</li>
				<li>Entrega: endereço com CEP.</li>
				<li>Pedidos: peças compradas, valores e status.</li>
			</ul>
			<p>
				Não guardamos dados de cartão: o pagamento é feito no ambiente do
				Mercado Pago.
			</p>
			<h2>Para que usamos</h2>
			<ul>
				<li>Processar e entregar seus pedidos e falar com você sobre eles.</li>
				<li>Cumprir obrigações legais, como emissão de documentos fiscais.</li>
				<li>Prevenir fraudes e manter a segurança da loja.</li>
			</ul>
			<h2>Com quem compartilhamos</h2>
			<p>
				Só com os serviços necessários para a loja funcionar: Mercado Pago
				(pagamentos), Supabase (banco de dados e login) e Cloudflare
				(hospedagem). Não vendemos seus dados.
			</p>
			<h2>Cookies</h2>
			<p>
				Usamos apenas os cookies necessários para manter você conectada à sua
				conta. As estatísticas de visita não usam cookies.
			</p>
			<h2>Seus direitos</h2>
			<p>
				Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer
				momento. Seus dados de cadastro podem ser corrigidos em Minha conta.
				Para os demais pedidos, fale com a gente pelo{" "}
				<a
					href={linkWhatsapp("Olá! Tenho um pedido sobre meus dados pessoais.")}
					className="underline underline-offset-4"
				>
					WhatsApp
				</a>{" "}
				ou pelo Instagram @{INSTAGRAM}.
			</p>
		</PaginaTexto>
	);
}
