import type { Metadata } from "next";
import { ZonasFrete } from "@/components/admin/zonas-frete";
import { alternarZona, salvarZona } from "@/server/acoes-frete";
import { zonasDeFrete } from "@/server/catalogo";

export const metadata: Metadata = { title: "Frete — Admin Xica Flor" };

export default async function Page() {
	return (
		<>
			<h1 className="display mb-8 text-head">Frete</h1>
			<ZonasFrete
				zonas={await zonasDeFrete()}
				acoes={{ salvar: salvarZona, alternar: alternarZona }}
			/>
		</>
	);
}
