"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";

type Aviso = { id: number; texto: string; saindo?: boolean };

const Contexto = createContext<(texto: string) => void>(() => {});

export const useAviso = () => useContext(Contexto);

const DURACAO = 4000;
const SAIDA = 170;

export function Avisos({ children }: { children: ReactNode }) {
	const [avisos, setAvisos] = useState<Aviso[]>([]);

	const avisar = useCallback((texto: string) => {
		const id = Date.now() + Math.random();
		setAvisos((atuais) => [...atuais, { id, texto }]);
		setTimeout(() => {
			setAvisos((atuais) =>
				atuais.map((a) => (a.id === id ? { ...a, saindo: true } : a)),
			);
			setTimeout(
				() => setAvisos((atuais) => atuais.filter((a) => a.id !== id)),
				SAIDA,
			);
		}, DURACAO);
	}, []);

	return (
		<Contexto value={avisar}>
			{children}
			<div
				role="status"
				className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-(--margem)"
			>
				{avisos.map((a) => (
					<p
						key={a.id}
						data-saindo={a.saindo || undefined}
						className="aviso bg-tinta px-5 py-3 text-small text-papel"
					>
						{a.texto}
					</p>
				))}
			</div>
		</Contexto>
	);
}
