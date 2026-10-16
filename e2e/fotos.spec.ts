import { deflateSync } from "node:zlib";
import { expect, test } from "@playwright/test";
import { entrar } from "./entrar";
import { ADMIN } from "./usuarios";

function png(
	largura: number,
	altura: number,
	[r, g, b]: [number, number, number],
) {
	const crc = (dados: Buffer) => {
		let c = ~0;
		for (const byte of dados) {
			c ^= byte;
			for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
		}
		return ~c >>> 0;
	};
	const bloco = (tipo: string, dados: Buffer) => {
		const corpo = Buffer.concat([Buffer.from(tipo), dados]);
		const tamanho = Buffer.alloc(4);
		tamanho.writeUInt32BE(dados.length);
		const soma = Buffer.alloc(4);
		soma.writeUInt32BE(crc(corpo));
		return Buffer.concat([tamanho, corpo, soma]);
	};
	const cabecalho = Buffer.alloc(13);
	cabecalho.writeUInt32BE(largura, 0);
	cabecalho.writeUInt32BE(altura, 4);
	cabecalho.set([8, 2, 0, 0, 0], 8);
	const linha = Buffer.concat([
		Buffer.from([0]),
		Buffer.alloc(largura * 3).map((_, i) => [r, g, b][i % 3]),
	]);
	const pixels = deflateSync(
		Buffer.concat(Array.from({ length: altura }, () => linha)),
	);
	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		bloco("IHDR", cabecalho),
		bloco("IDAT", pixels),
		bloco("IEND", Buffer.alloc(0)),
	]);
}

test("admin envia fotos com compressão, reordena e exclui", async ({
	page,
}, info) => {
	const nome = `Blusa Foto ${info.project.name} ${Date.now()}`;
	await entrar(page, ADMIN);
	await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();
	await page.goto("/admin/produtos/novo");
	await page.getByLabel("Nome").fill(nome);
	await page.getByLabel("Categoria").selectOption({ label: "Vestidos E2E" });
	await page.getByLabel("Preço (R$)").fill("99,90");
	await page.getByRole("button", { name: "Salvar produto" }).click();
	await expect(page).toHaveURL(/#fotos$/);
	await expect(page.getByText("Nenhuma foto ainda.")).toBeVisible();

	const fotos = page.locator("#fotos img");
	await page.getByLabel("Escolher da galeria").setInputFiles([
		{
			name: "vermelha.png",
			mimeType: "image/png",
			buffer: png(2000, 2500, [216, 27, 54]),
		},
		{
			name: "amarela.png",
			mimeType: "image/png",
			buffer: png(800, 1000, [248, 225, 84]),
		},
	]);
	await expect(fotos).toHaveCount(2, { timeout: 15_000 });
	await expect(page.getByLabel(/^Envio de/)).toHaveCount(0);

	const tamanho = await fotos
		.first()
		.evaluate((img: HTMLImageElement) => img.naturalWidth);
	expect(tamanho).toBeLessThanOrEqual(600);

	const ordemAntes = await fotos.evaluateAll((imgs) =>
		imgs.map((i) => (i as HTMLImageElement).src),
	);
	await page
		.getByRole("button", { name: "Mover foto 2 para a esquerda" })
		.click();
	await expect
		.poll(() =>
			fotos.evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src)),
		)
		.toEqual([ordemAntes[1], ordemAntes[0]]);

	await page.getByRole("button", { name: "Excluir foto 1" }).click();
	await expect(fotos).toHaveCount(1);

	await page
		.getByRole("navigation", { name: "Admin" })
		.getByRole("link", { name: "Produtos" })
		.click();
	const item = page.getByRole("listitem").filter({ hasText: nome }).first();
	await expect(item.locator("img")).toHaveAttribute("src", ordemAntes[0]);
});
