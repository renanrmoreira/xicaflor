import { Esqueleto } from "@/components/ui/esqueleto";

export default function Carregando() {
	return (
		<div className="flex flex-col gap-6">
			<Esqueleto className="h-16 w-56" />
			{[1, 2, 3, 4].map((n) => (
				<div key={n} className="flex flex-col gap-2">
					<Esqueleto className="h-5 w-3/5" />
					<Esqueleto className="h-4 w-24" />
					<Esqueleto className="h-11 w-full max-w-md" />
				</div>
			))}
		</div>
	);
}
