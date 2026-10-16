import type { CSSProperties } from "react";

type Props = { className?: string; rotulo?: string };

function Marca({
	arquivo,
	proporcao,
	className = "",
	rotulo,
}: Props & { arquivo: string; proporcao: string }) {
	return (
		<span
			role="img"
			aria-label={rotulo ?? "Xica Flor"}
			className={`marca ${className}`}
			style={
				{
					"--marca": `url(/marca/${arquivo})`,
					aspectRatio: proporcao,
				} as CSSProperties
			}
		/>
	);
}

export const Wordmark = (props: Props) => (
	<Marca arquivo="wordmark.svg" proporcao="236 / 96" {...props} />
);
export const Logo = (props: Props) => (
	<Marca arquivo="logo.svg" proporcao="1" {...props} />
);
