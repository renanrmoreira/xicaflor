"use client";

import { useEffect, useRef, useState } from "react";
import type { Foto } from "@/lib/loja";

export function Galeria({ fotos, nome }: { fotos: Foto[]; nome: string }) {
	const trilho = useRef<HTMLUListElement>(null);
	const [atual, setAtual] = useState(0);

	useEffect(() => {
		const raiz = trilho.current;
		if (!raiz) return;
		const observador = new IntersectionObserver(
			(entradas) => {
				for (const e of entradas)
					if (e.isIntersecting)
						setAtual(Number((e.target as HTMLElement).dataset.indice));
			},
			{ root: raiz, threshold: 0.6 },
		);
		for (const item of raiz.children) observador.observe(item);
		return () => observador.disconnect();
	}, []);

	if (!fotos.length)
		return (
			<div
				aria-hidden
				className="display grid aspect-4/5 place-items-center bg-linha text-[4rem] text-suave/40"
			>
				XF
			</div>
		);

	return (
		<div className="relative">
			<ul
				ref={trilho}
				aria-label={`Fotos de ${nome}`}
				className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:grid md:grid-cols-2 md:gap-(--vao) md:overflow-visible"
			>
				{fotos.map((f, i) => (
					<li
						key={f.grande}
						data-indice={i}
						className="w-full shrink-0 snap-center md:w-auto"
					>
						{/* biome-ignore lint/performance/noImgElement: fotos já comprimidas em dois tamanhos no envio */}
						<img
							src={f.grande}
							srcSet={`${f.miniatura} 600w, ${f.grande} 1600w`}
							sizes="(min-width: 768px) 30vw, 100vw"
							alt={f.alt || `${nome}, foto ${i + 1}`}
							width={1280}
							height={1600}
							loading={i === 0 ? "eager" : "lazy"}
							fetchPriority={i === 0 ? "high" : "auto"}
							decoding="async"
							className="aspect-4/5 w-full bg-linha object-cover"
						/>
					</li>
				))}
			</ul>
			{fotos.length > 1 && (
				<p
					aria-live="polite"
					className="absolute right-3 bottom-3 bg-papel/90 px-2 py-1 text-small tabular-nums md:hidden"
				>
					{atual + 1}/{fotos.length}
				</p>
			)}
		</div>
	);
}
