import Link from "next/link";
import {
	CNPJ,
	ENDERECO,
	INSTAGRAM,
	LINK_INSTAGRAM,
	linkWhatsapp,
	type RaizLoja,
	SLOGAN,
	TELEFONE,
} from "@/lib/loja";

const ITEM = "py-3 leading-snug text-papel/75 md:py-1.5";

export function Rodape({ raizes }: { raizes: RaizLoja[] }) {
	return (
		<footer className="mt-24 flex md:min-h-[70svh] flex-col justify-between gap-16 bg-bordo px-(--margem) pt-12 text-papel">
			<div className="grid grid-cols-2 gap-x-6 gap-y-8 text-small md:grid-cols-5">
				<div className="flex flex-col">
					<p className="mb-1 font-semibold text-papel">Loja</p>
					{raizes.map((r) => (
						<Link
							key={r.id}
							href={`/c/${r.slug}`}
							className={`${ITEM} hover:text-papel`}
						>
							{r.nome}
						</Link>
					))}
				</div>
				<div className="flex flex-col">
					<p className="mb-1 font-semibold text-papel">Contato</p>
					<a
						href={linkWhatsapp("Olá! Vim pelo site da Xica Flor.")}
						target="_blank"
						rel="noopener"
						className={`${ITEM} hover:text-papel`}
					>
						WhatsApp {TELEFONE}
					</a>
					<a
						href={LINK_INSTAGRAM}
						target="_blank"
						rel="noopener"
						className={`${ITEM} hover:text-papel`}
					>
						Instagram @{INSTAGRAM}
					</a>
				</div>
				<div className="flex flex-col">
					<p className="mb-1 font-semibold text-papel">Entrega</p>
					<p className={ITEM}>Grátis em Belém</p>
					<p className={ITEM}>Região metropolitana: valor do Moto Uber</p>
				</div>
				<div className="flex flex-col">
					<p className="mb-1 font-semibold text-papel">Ajuda</p>
					{[
						["/trocas", "Trocas e devoluções"],
						["/privacidade", "Privacidade"],
						["/sobre", "Sobre"],
						["/contato", "Contato"],
					].map(([href, rotulo]) => (
						<Link key={href} href={href} className={`${ITEM} hover:text-papel`}>
							{rotulo}
						</Link>
					))}
				</div>
				<div className="flex flex-col">
					<p className="mb-1 font-semibold text-papel">Belém, Pará</p>
					<p className={ITEM}>
						{ENDERECO}
						<br />
						CNPJ {CNPJ}
					</p>
					<p className={`${ITEM} mt-2 italic`}>{SLOGAN}</p>
				</div>
			</div>
			<div>
				<p
					aria-hidden
					className="display -mb-[0.1em] text-[clamp(4.5rem,23vw,22rem)] whitespace-nowrap text-amarelo"
				>
					Xica Flor
				</p>
				<p className="border-t border-papel/20 py-4 text-small text-papel/60">
					© {new Date().getFullYear()} Xica Flor — Moda Feminina
				</p>
			</div>
		</footer>
	);
}
