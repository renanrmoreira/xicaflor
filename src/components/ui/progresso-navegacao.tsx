"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { EVENTO_NAVEGACAO } from "@/lib/eventos";

type Estado = "ocioso" | "carregando" | "concluindo";

export function ProgressoNavegacao() {
	const pathname = usePathname();
	const [estado, setEstado] = useState<Estado>("ocioso");
	const anterior = useRef(pathname);

	useEffect(() => {
		const iniciar = () => setEstado("carregando");
		window.addEventListener(EVENTO_NAVEGACAO, iniciar);
		return () => window.removeEventListener(EVENTO_NAVEGACAO, iniciar);
	}, []);

	useEffect(() => {
		if (anterior.current === pathname) return;
		anterior.current = pathname;
		setEstado("concluindo");
		const t = setTimeout(() => setEstado("ocioso"), 400);
		return () => clearTimeout(t);
	}, [pathname]);

	return (
		<div
			aria-hidden
			data-estado={estado}
			className="progresso-nav fixed inset-x-0 top-0 z-50 h-0.5 bg-vermelho"
		/>
	);
}
