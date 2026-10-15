/** Contrato de camadas — PLANO.md §3. */
module.exports = {
	forbidden: [
		{
			name: "components-nao-importam-server",
			severity: "error",
			from: { path: "^src/components/" },
			to: { path: "^src/server/" },
		},
		{
			name: "server-nao-importa-ui",
			severity: "error",
			from: { path: "^src/server/" },
			to: { path: "^src/(app|components)/" },
		},
		{
			name: "lib-e-pura",
			severity: "error",
			from: { path: "^src/lib/" },
			to: { path: "^src/(app|components|server)/" },
		},
		{
			name: "service-role-so-em-server-supabase",
			comment: "Somente src/server/supabase.ts cria o client com service role.",
			severity: "error",
			from: { path: "^src/", pathNot: "^src/server/supabase.ts$" },
			to: { path: "^src/server/supabase.ts$" },
			// ponytail: regra por arquivo; se o client anon também morar ali, separar em server/supabase-admin.ts
		},
		{ name: "sem-ciclos", severity: "error", from: {}, to: { circular: true } },
	],
	options: {
		doNotFollow: { path: "node_modules" },
		tsConfig: { fileName: "tsconfig.json" },
		tsPreCompilationDeps: true,
	},
};
