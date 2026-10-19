import type { Metadata } from "next";
import { PaginaTexto } from "@/components/loja/pagina-texto";
import { ENDERECO, HORARIO, linkWhatsapp } from "@/lib/loja";

export const metadata: Metadata = {
	title: "Trocas e devoluções — Xica Flor",
	alternates: { canonical: "/trocas" },
};

export default function Page() {
	return (
		<PaginaTexto titulo="Trocas e devoluções">
			<h2>Direito de arrependimento</h2>
			<p>
				Comprou pelo site e mudou de ideia? Você tem até 7 dias corridos depois
				de receber o pedido para desistir da compra, sem precisar explicar o
				motivo (Código de Defesa do Consumidor, art. 49). Devolvemos o valor
				pago, inclusive o frete, e o custo de envio da devolução fica por conta
				da loja.
			</p>
			<h2>Troca por defeito</h2>
			<p>
				Trocamos somente peças com defeito, por outra do mesmo modelo. Avise em
				até 90 dias do recebimento: resolvemos em até 30 dias. Se não houver
				outra peça do mesmo modelo, devolvemos o valor pago.
			</p>
			<p>Não fazemos troca por tamanho, cor ou gosto.</p>
			<h2>Como pedir</h2>
			<ul>
				<li>
					Fale com a gente pelo{" "}
					<a
						href={linkWhatsapp(
							"Olá! Quero trocar ou devolver uma peça do meu pedido.",
						)}
						target="_blank"
						rel="noopener"
						className="underline underline-offset-4"
					>
						WhatsApp
					</a>{" "}
					informando o número do pedido.
				</li>
				<li>
					A peça pode ser entregue na loja, {ENDERECO}, {HORARIO}.
				</li>
			</ul>
		</PaginaTexto>
	);
}
