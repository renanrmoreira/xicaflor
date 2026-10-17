create table public.zonas_frete (
	id uuid primary key default gen_random_uuid(),
	nome text not null,
	cep_inicio char(8) not null check (cep_inicio ~ '^\d{8}$'),
	cep_fim char(8) not null check (cep_fim ~ '^\d{8}$'),
	preco_centavos int check (preco_centavos >= 0),
	ativo boolean not null default true,
	criado_em timestamptz not null default now(),
	check (cep_inicio <= cep_fim)
);

alter table public.zonas_frete enable row level security;
revoke all on public.zonas_frete from anon, authenticated;
grant select on public.zonas_frete to anon, authenticated;
grant insert, update, delete on public.zonas_frete to authenticated;

create policy "zonas ativas" on public.zonas_frete
	for select using (ativo or (select public.is_admin()));
create policy "admin escreve zonas" on public.zonas_frete
	for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.zonas_frete (nome, cep_inicio, cep_fim, preco_centavos) values
	('Belém', '66000000', '66999999', 0),
	('Mosqueiro', '66910000', '66920999', null),
	('Outeiro', '66840000', '66849999', null);
