import type { Metadata } from "next";
import { ArvoreCategorias } from "@/components/admin/categorias";
import {
	alternarCategoria,
	criarCategoria,
	moverCategoria,
	renomearCategoria,
	salvarLinkVitrine,
} from "@/server/acoes-categorias";
import { arvoreDeCategorias } from "@/server/catalogo";

export const metadata: Metadata = { title: "Categorias — Admin Xica Flor" };

export default async function Page() {
	const raizes = await arvoreDeCategorias();
	return (
		<>
			<h1 className="display mb-8 text-head">Categorias</h1>
			<ArvoreCategorias
				raizes={raizes}
				acoes={{
					criar: criarCategoria,
					renomear: renomearCategoria,
					alternar: alternarCategoria,
					mover: moverCategoria,
					salvarLink: salvarLinkVitrine,
				}}
			/>
		</>
	);
}
