import { Cabecalho } from "@/components/loja/cabecalho";
import { Rodape } from "@/components/loja/rodape";
import { categoriasDaLoja } from "@/server/loja";

export default async function Layout({ children }: LayoutProps<"/">) {
	const raizes = await categoriasDaLoja();
	return (
		<>
			<Cabecalho raizes={raizes} />
			<main className="flex-1">{children}</main>
			<Rodape raizes={raizes} />
		</>
	);
}
