import type { ReactNode } from "react";

export function PaginaTexto({
	titulo,
	children,
}: {
	titulo: string;
	children: ReactNode;
}) {
	return (
		<article className="flex max-w-2xl flex-col gap-6 px-(--margem) pt-10 [&_h2]:mt-4 [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-suave [&_li]:text-suave">
			<h1 className="display text-head">{titulo}</h1>
			{children}
		</article>
	);
}

export function APreencher({ children }: { children: ReactNode }) {
	return <mark className="bg-amarelo px-1 text-bordo">{children}</mark>;
}
