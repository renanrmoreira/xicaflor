import type { Metadata } from "next";
import { FormProduto } from "@/components/admin/form-produto";
import { salvarProduto } from "@/server/acoes-produtos";
import { arvoreDeCategorias } from "@/server/catalogo";

export const metadata: Metadata = { title: "Novo produto — Admin Xica Flor" };

export default async function Page() {
	return (
		<>
			<h1 className="display mb-8 text-head">Novo produto</h1>
			<FormProduto
				categorias={await arvoreDeCategorias()}
				acao={salvarProduto}
			/>
		</>
	);
}
