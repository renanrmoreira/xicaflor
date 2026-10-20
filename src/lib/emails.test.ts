import { expect, it } from "vitest";
import { emailsDoPedido, type PedidoEmail } from "./emails";

const pedido: PedidoEmail = {
	id: "ped-1",
	numero: 7,
	modalidade: "entrega",
	frete_a_combinar: false,
	frete_centavos: 0,
	total_centavos: 18990,
	endereco: {
		logradouro: "Rua A",
		numero: "10",
		bairro: "Umarizal",
		cidade: "Belém",
		cep: "66060000",
	},
	nome_cliente: "Maria <b>Silva</b>",
	telefone_cliente: "91988887777",
	itens: [
		{
			nome_produto: "Vestido <Ipê>",
			cor: "Azul",
			tamanho: "M",
			preco_unitario_centavos: 18990,
			quantidade: 1,
		},
	],
};

it("monta a confirmação da cliente e o aviso da loja com itens e links", () => {
	const { cliente, loja } = emailsDoPedido(pedido, "https://xicaflor.com.br");
	expect(cliente.assunto).toBe("Pedido nº 7 confirmado — Xica Flor");
	expect(cliente.html).toContain("https://xicaflor.com.br/pedido/ped-1");
	expect(cliente.html).toContain("separando suas peças");
	expect(loja.assunto).toContain("nº 7");
	expect(loja.html).toContain("https://xicaflor.com.br/admin/pedidos/ped-1");
	expect(loja.html).toContain("WhatsApp 91988887777");
	expect(loja.html).toContain("Rua A, 10");
});

it("escapa HTML vindo de nomes", () => {
	const { cliente, loja } = emailsDoPedido(pedido, "https://x");
	expect(cliente.html).toContain("Vestido &lt;Ipê&gt;");
	expect(loja.html).not.toContain("<b>Silva</b>");
});
