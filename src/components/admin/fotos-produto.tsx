"use client";

import { useState } from "react";
import { BotaoEnviar } from "@/components/ui/botao-enviar";
import { comprimir, TAMANHOS } from "@/lib/imagem";

type Foto = { id: string; alt: string; url: string };
type Destino = { path: string; url: string };
type Envio = { chave: string; nome: string; progresso: number; erro?: string };

type Props = {
	produtoId: string;
	nomeProduto: string;
	chavePublica: string;
	fotos: Foto[];
	acoes: {
		preparar: (
			produtoId: string,
			extensao: "webp" | "jpg",
		) => Promise<{ grande: Destino; miniatura: Destino }>;
		registrar: (
			produtoId: string,
			pathGrande: string,
			pathMiniatura: string,
			alt: string,
		) => Promise<void>;
		mover: (fotoId: string, direcao: -1 | 1) => Promise<void>;
		excluir: (fotoId: string) => Promise<void>;
	};
};

function enviarArquivo(
	destino: Destino,
	arquivo: Blob,
	chave: string,
	aoProgredir: (fracao: number) => void,
) {
	return new Promise<void>((ok, falha) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", destino.url);
		xhr.setRequestHeader("apikey", chave);
		xhr.setRequestHeader("content-type", arquivo.type);
		xhr.setRequestHeader("cache-control", "max-age=31536000");
		xhr.upload.onprogress = (e) =>
			e.lengthComputable && aoProgredir(e.loaded / e.total);
		xhr.onload = () =>
			xhr.status < 300
				? ok()
				: falha(new Error(`envio falhou (${xhr.status})`));
		xhr.onerror = () => falha(new Error("sem conexão"));
		xhr.send(arquivo);
	});
}

export function FotosProduto({
	produtoId,
	nomeProduto,
	chavePublica,
	fotos,
	acoes,
}: Props) {
	const [envios, setEnvios] = useState<Envio[]>([]);
	const atualizar = (chave: string, dados: Partial<Envio>) =>
		setEnvios((atual) =>
			atual.map((e) => (e.chave === chave ? { ...e, ...dados } : e)),
		);

	const enviar = async (arquivo: File) => {
		const chave = crypto.randomUUID();
		setEnvios((atual) => [
			...atual,
			{ chave, nome: arquivo.name, progresso: 0 },
		]);
		try {
			const bitmap = await createImageBitmap(arquivo, {
				imageOrientation: "from-image",
			});
			const [grande, miniatura] = await Promise.all([
				comprimir(bitmap, TAMANHOS.grande),
				comprimir(bitmap, TAMANHOS.miniatura),
			]);
			bitmap.close();
			atualizar(chave, { progresso: 0.05 });
			const destinos = await acoes.preparar(
				produtoId,
				grande.type === "image/webp" ? "webp" : "jpg",
			);
			const total = grande.size + miniatura.size;
			await enviarArquivo(destinos.miniatura, miniatura, chavePublica, (f) =>
				atualizar(chave, {
					progresso: 0.05 + (0.9 * f * miniatura.size) / total,
				}),
			);
			await enviarArquivo(destinos.grande, grande, chavePublica, (f) =>
				atualizar(chave, {
					progresso: 0.05 + (0.9 * (miniatura.size + f * grande.size)) / total,
				}),
			);
			await acoes.registrar(
				produtoId,
				destinos.grande.path,
				destinos.miniatura.path,
				nomeProduto,
			);
			setEnvios((atual) => atual.filter((e) => e.chave !== chave));
		} catch (erro) {
			atualizar(chave, {
				erro: erro instanceof Error ? erro.message : "falhou",
			});
		}
	};

	return (
		<section id="fotos" className="flex max-w-2xl flex-col gap-4">
			<h2 className="display text-[2rem]">Fotos</h2>
			{fotos.length === 0 && envios.length === 0 && (
				<p className="text-suave">
					Nenhuma foto ainda. A primeira foto vira a capa na loja.
				</p>
			)}
			<ul className="grid grid-cols-3 gap-(--vao) sm:grid-cols-4">
				{fotos.map((f, i) => (
					<li key={f.id} className="flex flex-col">
						{/* biome-ignore lint/performance/noImgElement: miniatura já comprimida no envio, sem otimizador */}
						<img
							src={f.url}
							alt={f.alt}
							width={600}
							height={750}
							className="aspect-4/5 w-full object-cover"
						/>
						<div className="flex justify-between">
							<form action={acoes.mover.bind(null, f.id, -1)}>
								<BotaoEnviar
									variante="fantasma"
									className="px-2"
									disabled={i === 0}
									aria-label={`Mover foto ${i + 1} para a esquerda`}
								>
									←
								</BotaoEnviar>
							</form>
							<form action={acoes.excluir.bind(null, f.id)}>
								<BotaoEnviar
									variante="fantasma"
									className="px-2 text-vermelho"
									aria-label={`Excluir foto ${i + 1}`}
								>
									✕
								</BotaoEnviar>
							</form>
							<form action={acoes.mover.bind(null, f.id, 1)}>
								<BotaoEnviar
									variante="fantasma"
									className="px-2"
									disabled={i === fotos.length - 1}
									aria-label={`Mover foto ${i + 1} para a direita`}
								>
									→
								</BotaoEnviar>
							</form>
						</div>
					</li>
				))}
				{envios.map((e) => (
					<li
						key={e.chave}
						className="entra flex aspect-4/5 flex-col justify-end gap-2 bg-linha p-2 text-small"
					>
						<span className="truncate">
							{e.erro ? `Erro: ${e.erro}` : "Enviando…"}
						</span>
						<progress
							value={e.progresso}
							max={1}
							aria-label={`Envio de ${e.nome}`}
							className="h-1 w-full appearance-none accent-vermelho"
						/>
					</li>
				))}
			</ul>
			<div className="flex flex-wrap gap-3">
				{[
					{ rotulo: "Tirar foto", camera: true },
					{ rotulo: "Escolher da galeria", camera: false },
				].map(({ rotulo, camera }) => (
					<label
						key={rotulo}
						className="botao cursor-pointer border-2 border-tinta hover:bg-tinta hover:text-papel has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-vermelho"
					>
						{rotulo}
						<input
							type="file"
							accept="image/*"
							capture={camera ? "environment" : undefined}
							multiple={!camera}
							className="sr-only"
							onChange={(e) => {
								for (const arquivo of e.target.files ?? []) enviar(arquivo);
								e.target.value = "";
							}}
						/>
					</label>
				))}
			</div>
		</section>
	);
}
