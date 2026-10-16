"use client";

import { type ReactNode, useEffect, useRef } from "react";

type Props = {
	aberta: boolean;
	aoFechar: () => void;
	titulo: string;
	children: ReactNode;
};

export function Gaveta({ aberta, aoFechar, titulo, children }: Props) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialogo = ref.current;
		if (!dialogo) return;
		if (aberta && !dialogo.open) dialogo.showModal();
		if (!aberta && dialogo.open) dialogo.close();
	}, [aberta]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: clique no fundo fecha; pelo teclado o Esc nativo do <dialog> já fecha
		<dialog
			ref={ref}
			className="gaveta"
			aria-label={titulo}
			onClose={aoFechar}
			onClick={(e) => e.target === e.currentTarget && aoFechar()}
		>
			<div className="flex h-full flex-col">
				<header className="flex items-center justify-between border-b border-linha px-(--margem) py-4">
					<h2 className="display text-[2rem]">{titulo}</h2>
					<button
						type="button"
						onClick={aoFechar}
						className="botao -mr-4 px-4"
						aria-label="Fechar"
					>
						<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
							<path
								d="M4 4l12 12M16 4L4 16"
								stroke="currentColor"
								strokeWidth="2"
							/>
						</svg>
					</button>
				</header>
				<div className="flex-1 overflow-y-auto px-(--margem) py-6">
					{children}
				</div>
			</div>
		</dialog>
	);
}
