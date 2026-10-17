import type { Metadata } from "next";
import { Checkout } from "@/components/loja/checkout";
import { conferirSacola, freteParaCep } from "@/server/acoes-loja";
import { finalizarCompra } from "@/server/acoes-pedido";
import { exigirCliente } from "@/server/cliente";

export const metadata: Metadata = {
	title: "Finalizar pedido — Xica Flor",
	robots: { index: false },
};

export default async function Page() {
	const { perfil } = await exigirCliente("/checkout");
	return (
		<section className="flex flex-col gap-8 px-(--margem) pt-10">
			<h1 className="display text-head">Finalizar pedido</h1>
			<Checkout
				endereco={perfil}
				conferir={conferirSacola}
				calcularFrete={freteParaCep}
				finalizar={finalizarCompra}
			/>
		</section>
	);
}
