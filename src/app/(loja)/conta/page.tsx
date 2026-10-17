import type { Metadata } from "next";
import { FormPerfil } from "@/components/conta/form-perfil";
import { Botao } from "@/components/ui/botao";
import { sair } from "@/server/acoes-auth";
import { salvarPerfil } from "@/server/acoes-conta";
import { exigirCliente } from "@/server/cliente";

export const metadata: Metadata = {
	title: "Minha conta — Xica Flor",
	robots: { index: false },
};

export default async function Page() {
	const { email, perfil } = await exigirCliente();
	return (
		<section className="flex flex-col gap-8 px-(--margem) pt-10">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-col gap-2">
					<h1 className="display text-head">Minha conta</h1>
					<p className="text-suave">{email}</p>
				</div>
				<form action={sair.bind(null, "/entrar")}>
					<Botao type="submit" variante="fantasma" className="-mr-6">
						Sair
					</Botao>
				</form>
			</div>
			<FormPerfil inicial={perfil} acao={salvarPerfil} />
		</section>
	);
}
