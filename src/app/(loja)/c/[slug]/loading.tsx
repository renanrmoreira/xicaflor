import { EsqueletoGrade } from "@/components/loja/esqueletos";
import { Esqueleto } from "@/components/ui/esqueleto";

export default function Carregando() {
	return (
		<section className="flex flex-col gap-10 px-(--margem) pt-10">
			<Esqueleto className="h-[clamp(3.5rem,14vw,9rem)] w-3/5" />
			<EsqueletoGrade />
		</section>
	);
}
