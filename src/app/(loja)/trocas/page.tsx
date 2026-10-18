import type { Metadata } from "next";
import { APreencher, PaginaTexto } from "@/components/loja/pagina-texto";
import { linkWhatsapp } from "@/lib/loja";

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
				pago, inclusive o frete.
			</p>
			<h2>Troca de tamanho ou modelo</h2>
			<p>
				<APreencher>Prazo e condições de troca definidos pela loja.</APreencher>
			</p>
			<h2>Peça com defeito</h2>
			<p>
				Se a peça chegar com defeito, avise em até 90 dias do recebimento.
				Trocamos a peça ou devolvemos o valor.
			</p>
			<h2>Como pedir</h2>
			<ul>
				<li>
					Fale com a gente pelo{" "}
					<a
						href={linkWhatsapp(
							"Olá! Quero trocar ou devolver uma peça do meu pedido.",
						)}
						className="underline underline-offset-4"
					>
						WhatsApp
					</a>{" "}
					informando o número do pedido.
				</li>
				<li>
					A peça deve voltar sem uso, com etiqueta e na embalagem original.
				</li>
				<li>
					Retirada ou entrega da devolução:{" "}
					<APreencher>endereço e horário da loja.</APreencher>
				</li>
			</ul>
		</PaginaTexto>
	);
}
