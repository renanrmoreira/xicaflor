import { Esqueleto } from "@/components/ui/esqueleto";

export default function Carregando() {
	return (
		<div className="flex flex-col gap-6">
			<Esqueleto className="h-16 w-56" />
			<Esqueleto className="h-11 w-full max-w-lg" />
			{[1, 2, 3, 4].map((n) => (
				<Esqueleto key={n} className="h-16 w-full" />
			))}
		</div>
	);
}
