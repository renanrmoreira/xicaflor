"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { log } from "@/lib/log";
import { exigirAdmin } from "./auth";
import { supabaseServidor } from "./supabase";

const BUCKET = "produtos";
const uuid = z.uuid();

export async function prepararEnvio(
	produtoId: string,
	extensao: "webp" | "jpg",
) {
	await exigirAdmin();
	const base = `${uuid.parse(produtoId)}/${crypto.randomUUID()}`;
	const storage = (await supabaseServidor()).storage.from(BUCKET);
	const [grande, miniatura] = await Promise.all(
		[`${base}-g.${extensao}`, `${base}-m.${extensao}`].map(async (path) => {
			const { data, error } = await storage.createSignedUploadUrl(path);
			if (error) throw error;
			return { path, url: data.signedUrl };
		}),
	);
	return { grande, miniatura };
}

export async function registrarFoto(
	produtoId: string,
	pathGrande: string,
	pathMiniatura: string,
	alt: string,
) {
	await exigirAdmin();
	const id = uuid.parse(produtoId);
	if (![pathGrande, pathMiniatura].every((p) => p.startsWith(`${id}/`)))
		throw new Error("caminho inválido");
	const supabase = await supabaseServidor();
	const { count } = await supabase
		.from("produto_fotos")
		.select("id", { count: "exact", head: true })
		.eq("produto_id", id);
	const { error } = await supabase.from("produto_fotos").insert({
		produto_id: id,
		path_grande: pathGrande,
		path_miniatura: pathMiniatura,
		alt: z.string().trim().max(200).parse(alt),
		ordem: count ?? 0,
	});
	if (error) throw error;
	revalidatePath("/", "layout");
}

// ponytail: troca de ordem em updates sem transação; basta para dois admins
export async function moverFoto(fotoId: string, direcao: -1 | 1) {
	await exigirAdmin();
	const supabase = await supabaseServidor();
	const { data: foto } = await supabase
		.from("produto_fotos")
		.select("produto_id")
		.eq("id", uuid.parse(fotoId))
		.single();
	if (!foto) return;
	const { data: irmas } = await supabase
		.from("produto_fotos")
		.select("id")
		.eq("produto_id", foto.produto_id)
		.order("ordem");
	const lista = irmas?.map((f) => f.id) ?? [];
	const i = lista.indexOf(fotoId);
	const j = i + direcao;
	if (i < 0 || j < 0 || j >= lista.length) return;
	[lista[i], lista[j]] = [lista[j], lista[i]];
	await Promise.all(
		lista.map((id, ordem) =>
			supabase.from("produto_fotos").update({ ordem }).eq("id", id),
		),
	);
	revalidatePath("/", "layout");
}

export async function excluirFoto(fotoId: string) {
	await exigirAdmin();
	const supabase = await supabaseServidor();
	const { data: foto } = await supabase
		.from("produto_fotos")
		.delete()
		.eq("id", uuid.parse(fotoId))
		.select("produto_id, path_grande, path_miniatura")
		.single();
	if (!foto) return;
	const { error } = await supabase.storage
		.from(BUCKET)
		.remove([foto.path_grande, foto.path_miniatura]);
	if (error)
		log("warn", "arquivos de foto não removidos", { erro: error.message });
	revalidatePath("/", "layout");
}
