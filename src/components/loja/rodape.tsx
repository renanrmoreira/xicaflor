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

const LINK =
	"flex min-h-11 items-center text-papel/75 hover:text-papel md:min-h-8";
const TEXTO = "py-1 leading-snug text-papel/75";

export function Rodape({ raizes }: { raizes: RaizLoja[] }) {
	return (
		<footer className="mt-24 flex flex-col gap-16 bg-bordo px-(--margem) pt-12 text-papel">
			<div className="grid grid-cols-2 gap-x-6 gap-y-8 text-small md:grid-cols-5">
				<div className="flex flex-col">
					<p className="mb-1 font-semibold">Loja</p>
					{raizes.map((r) => (
						<Link key={r.id} href={`/c/${r.slug}`} className={LINK}>
							{r.nome}
						</Link>
					))}
				</div>
				<div className="flex flex-col">
					<p className="mb-1 font-semibold">Contato</p>
					<a
						href={linkWhatsapp("Olá! Vim pelo site da Xica Flor.")}
						target="_blank"
						rel="noopener"
						className={LINK}
					>
						WhatsApp {TELEFONE}
					</a>
					<a
						href={LINK_INSTAGRAM}
						target="_blank"
						rel="noopener"
						className={LINK}
					>
						Instagram @{INSTAGRAM}
					</a>
				</div>
				<div className="flex flex-col">
					<p className="mb-1 font-semibold">Entrega</p>
					<p className={TEXTO}>Grátis em Belém</p>
					<p className={TEXTO}>Região metropolitana: valor do Moto Uber</p>
				</div>
				<div className="flex flex-col">
					<p className="mb-1 font-semibold">Ajuda</p>
					{[
						["/trocas", "Trocas e devoluções"],
						["/privacidade", "Privacidade"],
						["/sobre", "Sobre"],
						["/contato", "Contato"],
					].map(([href, rotulo]) => (
						<Link key={href} href={href} className={LINK}>
							{rotulo}
						</Link>
					))}
				</div>
				<div className="flex flex-col">
					<p className="mb-1 font-semibold">Belém, Pará</p>
					<p className={TEXTO}>
						{ENDERECO}
						<br />
						CNPJ {CNPJ}
					</p>
					<p className={`${TEXTO} mt-2 italic`}>{SLOGAN}</p>
				</div>
			</div>
			<div>
				<p
					aria-hidden
					className="display pb-2 text-[clamp(3.5rem,18vw,16rem)] leading-[0.85] whitespace-nowrap text-amarelo"
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
