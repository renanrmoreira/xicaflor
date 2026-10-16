import { Esqueleto } from "@/components/ui/esqueleto";

export default function Carregando() {
	return (
		<div className="grid gap-8 md:grid-cols-[3fr_2fr] md:gap-12 md:px-(--margem) md:pt-8">
			<Esqueleto className="aspect-4/5 w-full md:w-1/2" />
			<div className="flex flex-col gap-4 px-(--margem) md:px-0">
				<Esqueleto className="h-4 w-24" />
				<Esqueleto className="h-14 w-4/5" />
				<Esqueleto className="h-7 w-32" />
				<div className="flex gap-2">
					{[1, 2, 3].map((n) => (
						<Esqueleto key={n} className="size-12" />
					))}
				</div>
				<Esqueleto className="h-12 w-full" />
			</div>
		</div>
	);
}
