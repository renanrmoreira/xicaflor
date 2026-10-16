import "server-only";
import { supabaseServidor } from "./supabase";

export type Categoria = {
	id: string;
	nome: string;
	slug: string;
	ordem: number;
	ativo: boolean;
	link_vitrine: string | null;
	filhas: Categoria[];
};

export async function arvoreDeCategorias(): Promise<Categoria[]> {
	const supabase = await supabaseServidor();
	const { data, error } = await supabase
		.from("categorias")
		.select("id, nome, slug, ordem, ativo, link_vitrine, parent_id")
		.order("ordem")
		.order("nome");
	if (error) throw error;
	const raizes = data
		.filter((c) => !c.parent_id)
		.map((c) => ({ ...c, filhas: [] as Categoria[] }));
	for (const c of data)
		raizes.find((r) => r.id === c.parent_id)?.filhas.push({ ...c, filhas: [] });
	return raizes;
}
