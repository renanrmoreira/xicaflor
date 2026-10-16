type Filha = { id: string; nome: string; ativo: boolean };
type Raiz = { id: string; nome: string; vitrine: boolean; filhas: Filha[] };

export function gruposDeCategoria(raizes: Raiz[], atual: string) {
	return raizes.map((r) => ({
		id: r.id,
		rotulo: r.vitrine ? `${r.nome} (vitrine)` : r.nome,
		nome: r.nome,
		opcoes: r.filhas.filter((f) => f.ativo || f.id === atual),
	}));
}
