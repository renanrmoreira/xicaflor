import { Cabecalho } from "@/components/loja/cabecalho";
import { Rodape } from "@/components/loja/rodape";
import { Sacola } from "@/components/loja/sacola";
import { conferirSacola } from "@/server/acoes-loja";
import { categoriasDaLoja } from "@/server/loja";

export default async function Layout({ children }: LayoutProps<"/">) {
	const raizes = await categoriasDaLoja();
	return (
		<Sacola conferir={conferirSacola}>
			<Cabecalho raizes={raizes} />
			<main className="flex-1">{children}</main>
			<Rodape raizes={raizes} />
		</Sacola>
	);
}
