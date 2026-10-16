import { EsqueletoGrade } from "@/components/loja/esqueletos";
import { Esqueleto } from "@/components/ui/esqueleto";

export default function Carregando() {
	return (
		<section className="flex flex-col gap-8 px-(--margem) pt-8">
			<div className="flex flex-col gap-2">
				<Esqueleto className="h-4 w-24" />
				<Esqueleto className="h-14 w-full" />
			</div>
			<EsqueletoGrade quantidade={4} />
		</section>
	);
}
