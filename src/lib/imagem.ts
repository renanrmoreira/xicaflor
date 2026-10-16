export const TAMANHOS = { grande: 1600, miniatura: 600 } as const;

export function medidas(largura: number, altura: number, maximo: number) {
	const escala = Math.min(1, maximo / Math.max(largura, altura));
	return {
		largura: Math.round(largura * escala),
		altura: Math.round(altura * escala),
	};
}

function emBlob(canvas: HTMLCanvasElement, tipo: string, qualidade: number) {
	return new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, qualidade));
}

export async function comprimir(
	imagem: ImageBitmap,
	maximo: number,
): Promise<Blob> {
	const { largura, altura } = medidas(imagem.width, imagem.height, maximo);
	const canvas = document.createElement("canvas");
	canvas.width = largura;
	canvas.height = altura;
	canvas.getContext("2d")?.drawImage(imagem, 0, 0, largura, altura);
	const webp = await emBlob(canvas, "image/webp", 0.82);
	if (webp?.type === "image/webp") return webp;
	const jpeg = await emBlob(canvas, "image/jpeg", 0.85);
	if (!jpeg) throw new Error("Não foi possível processar a imagem.");
	return jpeg;
}
