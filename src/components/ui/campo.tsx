import { type InputHTMLAttributes, useId } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
	rotulo: string;
	erro?: string;
};

export function Campo({ rotulo, erro, className = "", ...props }: Props) {
	const id = useId();
	return (
		<div className={`flex flex-col gap-1.5 ${className}`}>
			<label htmlFor={id} className="text-small font-semibold">
				{rotulo}
			</label>
			<input
				id={id}
				aria-invalid={erro ? true : undefined}
				aria-describedby={erro ? `${id}-erro` : undefined}
				className="min-h-12 w-full min-w-0 border border-linha bg-papel px-3.5 transition-colors duration-150 hover:border-suave focus:border-tinta focus:outline-none aria-invalid:border-vermelho"
				{...props}
			/>
			{erro && (
				<p id={`${id}-erro`} className="entra text-small text-vermelho">
					{erro}
				</p>
			)}
		</div>
	);
}
