import { Esqueleto } from "@/components/ui/esqueleto";

export default function Carregando() {
	return (
		<div className="flex flex-col gap-8">
			<Esqueleto className="h-16 w-48" />
			<div className="grid gap-4 sm:grid-cols-2">
				<Esqueleto className="h-32 w-full" />
				<Esqueleto className="h-32 w-full" />
			</div>
			<Esqueleto className="h-64 w-full" />
		</div>
	);
}
