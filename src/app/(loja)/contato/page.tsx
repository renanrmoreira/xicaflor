import type { Metadata } from "next";
import { APreencher, PaginaTexto } from "@/components/loja/pagina-texto";
import { classeBotao } from "@/components/ui/botao";
import { INSTAGRAM, linkWhatsapp } from "@/lib/loja";

export const metadata: Metadata = {
	title: "Contato — Xica Flor",
	alternates: { canonical: "/contato" },
};

export default function Page() {
	return (
		<PaginaTexto titulo="Contato">
			<p>Atendemos pelo WhatsApp e pelo Instagram.</p>
			<div className="flex flex-wrap gap-3">
				<a
					href={linkWhatsapp("Olá! Vim pelo site da Xica Flor.")}
					target="_blank"
					rel="noopener"
					className={classeBotao()}
				>
					WhatsApp (91) 98800-8817
				</a>
				<a
					href={`https://instagram.com/${INSTAGRAM}`}
					target="_blank"
					rel="noopener"
					className={classeBotao("secundario")}
				>
					Instagram @{INSTAGRAM}
				</a>
			</div>
			<h2>Retirada na loja</h2>
			<p>
				<APreencher>Endereço e horário de funcionamento.</APreencher>
			</p>
		</PaginaTexto>
	);
}
