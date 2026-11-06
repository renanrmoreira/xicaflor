import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
	FormCadastro,
	FormEntrar,
	FormRecuperarSenha,
} from "@/components/conta/form-entrar";
import { criarConta, entrar, recuperarSenha } from "@/server/acoes-auth";
import { supabaseServidor } from "@/server/supabase";

export const metadata: Metadata = {
	title: "Entrar — Xica Flor",
	robots: { index: false },
};

export default async function Page({ searchParams }: PageProps<"/entrar">) {
	const { volta, link } = await searchParams;
	const destino = volta === "/checkout" ? "/checkout" : "/conta";
	const {
		data: { user },
	} = await (await supabaseServidor()).auth.getUser();
	if (user) redirect(destino);
	return (
		<div className="grid gap-12 px-(--margem) pt-10 md:grid-cols-2 md:gap-16">
			<div className="flex flex-col gap-10">
				<section className="flex flex-col gap-6">
					<h1 className="display text-head">Entrar</h1>
					{link === "expirado" && (
						<p role="alert" className="bg-amarelo p-3 text-bordo">
							O link expirou ou já foi usado. Peça um novo abaixo.
						</p>
					)}
					<FormEntrar
						acao={entrar.bind(null, destino)}
						captcha={process.env.TURNSTILE_SITE_KEY}
					/>
					<details className="group flex flex-col gap-4">
						<summary className="flex min-h-11 cursor-pointer items-center self-start text-small underline underline-offset-4 marker:content-none">
							Esqueci minha senha
						</summary>
						<div className="flex flex-col gap-4 pt-2">
							<p className="text-small text-suave">
								Informe o e-mail da sua conta para receber um link e criar uma
								nova senha.
							</p>
							<FormRecuperarSenha
								acao={recuperarSenha}
								captcha={process.env.TURNSTILE_SITE_KEY}
							/>
						</div>
					</details>
				</section>
			</div>
			<section className="flex flex-col gap-6 border-t border-linha pt-10 md:border-t-0 md:border-l md:pt-0 md:pl-16">
				<h2 className="display text-head">Criar conta</h2>
				<p className="text-suave">
					Só nome, e-mail e senha. O endereço você completa depois.
				</p>
				<FormCadastro
					acao={criarConta}
					captcha={process.env.TURNSTILE_SITE_KEY}
				/>
			</section>
		</div>
	);
}
