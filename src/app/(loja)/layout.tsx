import { Cabecalho } from "@/components/loja/cabecalho";
import { Rodape } from "@/components/loja/rodape";
import { Sacola } from "@/components/loja/sacola";
import { conferirSacola, freteParaCep } from "@/server/acoes-loja";
import { categoriasDaLoja } from "@/server/loja";

export default async function Layout({ children }: LayoutProps<"/">) {
	const raizes = await categoriasDaLoja();
	return (
		<Sacola conferir={conferirSacola} calcularFrete={freteParaCep}>
			<a
				href="#conteudo"
				className="sr-only z-50 bg-amarelo px-4 py-3 font-semibold text-bordo focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
			>
				Pular para o conteúdo
			</a>
			<Cabecalho raizes={raizes} />
			<main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
				{children}
			</main>
			<Rodape raizes={raizes} />
		</Sacola>
	);
}
