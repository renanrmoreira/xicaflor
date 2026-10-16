import type { ButtonHTMLAttributes } from "react";

const variantes = {
	primario: "bg-vermelho text-papel hover:bg-bordo",
	secundario:
		"border-2 border-tinta text-tinta hover:bg-tinta hover:text-papel",
	fantasma: "text-tinta underline-offset-4 hover:underline",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	variante?: keyof typeof variantes;
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
			className={`botao ${variantes[variante]} ${className}`}
			disabled={disabled || pendente}
			aria-busy={pendente || undefined}
			{...props}
		>
			{pendente && <span className="giro" aria-hidden />}
			{pendente && rotuloPendente ? rotuloPendente : children}
		</button>
	);
}
