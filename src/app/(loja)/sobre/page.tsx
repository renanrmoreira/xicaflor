import type { Metadata } from "next";
import { PaginaTexto } from "@/components/loja/pagina-texto";
import { SLOGAN } from "@/lib/loja";

export const metadata: Metadata = {
	title: "Sobre — Xica Flor",
	alternates: { canonical: "/sobre" },
};

export default function Page() {
	return (
		<PaginaTexto titulo="Sobre a Xica Flor">
			<p className="text-lead text-tinta">{SLOGAN}</p>
			<p>
				A Xica Flor é uma loja de moda feminina de Belém do Pará. Escolhemos
				cada peça pensando em mulheres reais, que se vestem para si mesmas.
			</p>
			<p>
				Na seção Beleza, indicamos produtos de marcas parceiras. A compra desses
				produtos é feita na loja oficial de cada marca.
			</p>
		</PaginaTexto>
	);
}
