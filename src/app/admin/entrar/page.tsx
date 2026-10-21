import type { Metadata } from "next";
import { FormEntrar } from "@/components/conta/form-entrar";
import { Wordmark } from "@/components/ui/marca";
import { entrar } from "@/server/acoes-auth";

export const metadata: Metadata = {
	title: "Entrar — Admin Xica Flor",
	robots: { index: false },
};

export default function Page() {
	return (
		<main className="flex flex-1 flex-col">
			<header className="bg-amarelo px-(--margem) pt-8 pb-6 text-vermelho">
				<Wordmark className="w-32" />
				<h1 className="display mt-10 text-head text-bordo">Admin</h1>
			</header>
			<section className="entra mx-auto w-full max-w-sm px-(--margem) py-10">
				<FormEntrar
					acao={entrar.bind(null, "/admin")}
					captcha={process.env.TURNSTILE_SITE_KEY}
				/>
			</section>
		</main>
	);
}
