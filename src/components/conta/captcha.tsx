"use client";

import { useEffect, useRef, useState } from "react";

type Turnstile = {
	render: (el: HTMLElement, opcoes: Record<string, unknown>) => string;
	reset: (id: string) => void;
	remove: (id: string) => void;
};
declare global {
	interface Window {
		turnstile?: Turnstile;
		turnstilePronto?: () => void;
	}
}

let carregando: Promise<Turnstile> | undefined;

function carregar() {
	carregando ??= new Promise<Turnstile>((ok, falha) => {
		window.turnstilePronto = () => window.turnstile && ok(window.turnstile);
		const script = document.createElement("script");
		script.src =
			"https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=turnstilePronto";
		script.async = true;
		script.onerror = () => {
			carregando = undefined;
			falha(new Error("Turnstile não carregou"));
		};
		document.head.append(script);
	});
	return carregando;
}

export function Captcha({
	chave,
	renovar,
}: {
	chave?: string;
	renovar: unknown;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const id = useRef<string | null>(null);
	const [falhou, setFalhou] = useState(false);

	useEffect(() => {
		if (!chave) return;
		let ativo = true;
		carregar().then(
			(t) => {
				if (ativo && ref.current)
					id.current = t.render(ref.current, {
						sitekey: chave,
						language: "pt-br",
					});
			},
			() => ativo && setFalhou(true),
		);
		return () => {
			ativo = false;
			if (id.current) window.turnstile?.remove(id.current);
			id.current = null;
		};
	}, [chave]);

	useEffect(() => {
		if (renovar && id.current) window.turnstile?.reset(id.current);
	}, [renovar]);

	if (!chave) return null;
	return falhou ? (
		<p role="alert" className="text-small text-vermelho">
			Não foi possível carregar a verificação de segurança. Recarregue a página.
		</p>
	) : (
		<div ref={ref} className="min-h-[65px]" />
	);
}
