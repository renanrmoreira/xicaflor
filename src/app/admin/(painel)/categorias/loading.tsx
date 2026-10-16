import { Esqueleto } from "@/components/ui/esqueleto";

export default function Carregando() {
	return (
		<div className="flex flex-col gap-12">
			<Esqueleto className="h-16 w-64" />
			{[1, 2].map((n) => (
				<div key={n} className="flex flex-col gap-3">
					<Esqueleto className="h-10 w-40" />
					{[1, 2, 3].map((l) => (
						<Esqueleto key={l} className="h-11 w-full" />
					))}
				</div>
			))}
		</div>
	);
}
