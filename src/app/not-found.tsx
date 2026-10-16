import Link from "next/link";

export default function NaoEncontrada() {
	return (
		<main className="flex flex-1 flex-col justify-between bg-amarelo px-(--margem) pt-10 pb-4 text-bordo">
			<div className="entra flex max-w-md flex-col gap-4">
				<h1 className="display text-head">Página não encontrada</h1>
				<p>O endereço pode ter mudado ou a peça saiu do catálogo.</p>
				<Link
					href="/"
					className="botao self-start bg-vermelho text-papel hover:bg-bordo"
				>
					Ir para a loja
				</Link>
			</div>
			<p
				aria-hidden
				className="display -mb-[0.12em] text-display text-vermelho"
			>
				404
			</p>
		</main>
	);
}
