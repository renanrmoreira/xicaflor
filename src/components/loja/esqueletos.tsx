import { Esqueleto } from "@/components/ui/esqueleto";

export function EsqueletoGrade({ quantidade = 8 }: { quantidade?: number }) {
	return (
		<ul
			aria-hidden
			className="grid grid-cols-2 gap-x-(--vao) gap-y-8 md:grid-cols-4"
		>
			{Array.from({ length: quantidade }, (_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: marcadores estáticos sem identidade
				<li key={i} className="flex flex-col gap-2">
					<Esqueleto className="aspect-4/5" />
					<Esqueleto className="h-5 w-4/5" />
					<Esqueleto className="h-5 w-2/5" />
				</li>
			))}
		</ul>
	);
}
