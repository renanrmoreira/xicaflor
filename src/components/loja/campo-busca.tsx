"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export function CampoBusca({ inicial }: { inicial: string }) {
	const router = useRouter();
	const [termo, setTermo] = useState(inicial);
	const [pendente, iniciar] = useTransition();
	const espera = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(espera.current), []);

	const buscar = (valor: string) => {
		setTermo(valor);
		clearTimeout(espera.current);
		espera.current = setTimeout(() => {
			const q = valor.trim();
			iniciar(() =>
				router.replace(q ? `/busca?q=${encodeURIComponent(q)}` : "/busca", {
					scroll: false,
				}),
			);
		}, 250);
	};

	return (
		<form action="/busca" className="flex flex-col gap-2">
			<label htmlFor="busca" className="text-small font-semibold">
				Buscar peças
			</label>
			<div className="flex items-center border-b-2 border-tinta">
				<input
					id="busca"
					name="q"
					type="search"
					inputMode="search"
					enterKeyHint="search"
					autoComplete="off"
					// biome-ignore lint/a11y/noAutofocus: página dedicada à busca, aberta pelo ícone de lupa
					autoFocus
					value={termo}
					onChange={(e) => buscar(e.target.value)}
					placeholder="Vestido, blusa, batom…"
					className="min-h-14 w-full min-w-0 bg-transparent text-lead outline-none placeholder:text-suave/70"
				/>
				{pendente && <span aria-hidden className="giro text-suave" />}
			</div>
		</form>
	);
}
