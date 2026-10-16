import { EsqueletoGrade } from "@/components/loja/esqueletos";
import { Esqueleto } from "@/components/ui/esqueleto";

export default function Carregando() {
	return (
		<>
			<div className="min-h-[78svh] bg-amarelo" />
			<section className="flex flex-col gap-8 px-(--margem) pt-16">
				<Esqueleto className="h-16 w-64" />
				<EsqueletoGrade />
			</section>
		</>
	);
}
