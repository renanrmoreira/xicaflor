import type { Metadata } from "next";
import { FormNovaSenha } from "@/components/conta/form-entrar";
import { trocarSenha } from "@/server/acoes-auth";
import { exigirCliente } from "@/server/cliente";

export const metadata: Metadata = {
	title: "Nova senha — Xica Flor",
	robots: { index: false },
};

export default async function Page() {
	await exigirCliente();
	return (
		<section className="flex flex-col gap-6 px-(--margem) pt-10">
			<h1 className="display text-head">Nova senha</h1>
			<FormNovaSenha acao={trocarSenha} />
		</section>
	);
}
