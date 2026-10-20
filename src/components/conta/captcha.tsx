"use client";

import { useEffect, useRef } from "react";

type Turnstile = {
	render: (el: HTMLElement, opcoes: Record<string, string>) => string;
	reset: (id: string) => void;
	remove: (id: string) => void;
};
declare global {
	interface Window {
		turnstile?: Turnstile;
	}
}

const SCRIPT =
	"https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function carregar() {
	if (window.turnstile) return Promise.resolve(window.turnstile);
	return new Promise<Turnstile>((ok) => {
		let script = document.querySelector<HTMLScriptElement>(
			`script[src="${SCRIPT}"]`,
		);
		if (!script) {
			script = document.createElement("script");
			script.src = SCRIPT;
			script.async = true;
			document.head.append(script);
		}
		script.addEventListener(
			"load",
			() => window.turnstile && ok(window.turnstile),
		);
	});
}

export function Captcha({
	chave,
	renovar,
}: {
	chave?: string;
	renovar: unknown;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const id = useRef<string>(null);

	useEffect(() => {
		if (!chave) return;
		let ativo = true;
		carregar().then((t) => {
			if (ativo && ref.current)
				id.current = t.render(ref.current, {
					sitekey: chave,
					language: "pt-br",
				});
		});
		return () => {
			ativo = false;
			if (id.current) window.turnstile?.remove(id.current);
		};
	}, [chave]);

	useEffect(() => {
		if (renovar && id.current) window.turnstile?.reset(id.current);
	}, [renovar]);

	return chave ? <div ref={ref} className="min-h-[65px]" /> : null;
}
