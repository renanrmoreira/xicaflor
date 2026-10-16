import { EsqueletoGrade } from "@/components/loja/esqueletos";
import { Esqueleto } from "@/components/ui/esqueleto";

export default function Carregando() {
	return (
		<section className="px-(--margem) pt-10">
			<div className="flex flex-col gap-4">
				<Esqueleto className="h-[clamp(3.1rem,12.3vw,7.9rem)] w-3/5" />
			</div>
			<div className="mt-6 mb-8 flex gap-2">
				<Esqueleto className="h-11 w-16" />
				<Esqueleto className="h-11 w-24" />
				<Esqueleto className="h-11 w-20" />
			</div>
			<div className="mt-8">
				<EsqueletoGrade />
			</div>
		</section>
	);
}
