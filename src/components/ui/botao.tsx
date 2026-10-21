import type { ComponentProps } from "react";

const variantes = {
	primario:
		"bg-vermelho text-papel hover:bg-bordo [&:disabled:not([aria-busy])]:bg-linha [&:disabled:not([aria-busy])]:text-suave [&:disabled:not([aria-busy])]:opacity-100",
	secundario:
		"border-2 border-tinta text-tinta hover:bg-tinta hover:text-papel",
	fantasma: "text-tinta underline-offset-4 hover:underline",
};

export type Variante = keyof typeof variantes;

export const classeBotao = (variante: Variante = "primario") =>
	`botao ${variantes[variante]}`;

type Props = ComponentProps<"button"> & {
	variante?: Variante;
	pendente?: boolean;
	rotuloPendente?: string;
};

export function Botao({
	variante = "primario",
	pendente = false,
	rotuloPendente,
	className = "",
	children,
	disabled,
	...props
}: Props) {
	return (
		<button
			className={`${classeBotao(variante)} ${className}`}
			disabled={disabled || pendente}
			aria-busy={pendente || undefined}
			{...props}
		>
			{pendente && <span className="giro" aria-hidden />}
			{pendente && rotuloPendente ? rotuloPendente : children}
		</button>
	);
}
