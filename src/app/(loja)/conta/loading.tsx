import { Esqueleto } from "@/components/ui/esqueleto";

export default function Carregando() {
	return (
		<section className="flex flex-col gap-8 px-(--margem) pt-10">
			<div className="flex flex-col gap-2">
				<Esqueleto className="h-14 w-3/4" />
				<Esqueleto className="h-5 w-48" />
			</div>
			<div className="flex flex-col gap-4">
				<Esqueleto className="h-8 w-40" />
				{[1, 2, 3].map((i) => (
					<Esqueleto key={i} className="h-16 w-full" />
				))}
			</div>
		</section>
	);
}
