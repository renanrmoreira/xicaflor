create table public.perfis (
	id uuid primary key references auth.users on delete cascade,
	nome text,
	telefone text,
	cep char(8),
	logradouro text,
	numero text,
	complemento text,
	bairro text,
	cidade text,
	uf char(2),
	papel text not null default 'cliente' check (papel in ('cliente', 'admin')),
	criado_em timestamptz not null default now()
);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
	select exists (select 1 from public.perfis where id = auth.uid() and papel = 'admin')
$$;

create function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.perfis (id, nome) values (new.id, new.raw_user_meta_data ->> 'nome');
	return new;
end;
$$;

create trigger ao_criar_usuario
after insert on auth.users
for each row execute function public.criar_perfil();

create table public.categorias (
	id uuid primary key default gen_random_uuid(),
	nome text not null,
	slug text not null unique,
	parent_id uuid references public.categorias on delete restrict,
	ordem int not null default 0,
	ativo boolean not null default true,
	link_vitrine text check (link_vitrine is null or (parent_id is null and link_vitrine ~ '^https://')),
	criado_em timestamptz not null default now()
);

create table public.produtos (
	id uuid primary key default gen_random_uuid(),
	nome text not null,
	slug text not null unique,
	descricao text not null default '',
	marca text,
	categoria_id uuid not null references public.categorias on delete restrict,
	ativo boolean not null default true,
	destaque boolean not null default false,
	criado_em timestamptz not null default now()
);

create table public.produto_fotos (
	id uuid primary key default gen_random_uuid(),
	produto_id uuid not null references public.produtos on delete cascade,
	path_grande text not null,
	path_miniatura text not null,
	alt text not null default '',
	ordem int not null default 0
);

create table public.variantes (
	id uuid primary key default gen_random_uuid(),
	produto_id uuid not null references public.produtos on delete cascade,
	cor text,
	tamanho text,
	preco_centavos int not null check (preco_centavos > 0),
	estoque int not null default 0 check (estoque >= 0),
	ativo boolean not null default true,
	unique nulls not distinct (produto_id, cor, tamanho)
);

create index on public.categorias (parent_id);
create index on public.produtos (categoria_id);
create index on public.produto_fotos (produto_id);
create index on public.variantes (produto_id);

alter table public.perfis enable row level security;
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.produto_fotos enable row level security;
alter table public.variantes enable row level security;

revoke all on public.perfis, public.categorias, public.produtos, public.produto_fotos, public.variantes from anon, authenticated;
grant select on public.categorias, public.produtos, public.produto_fotos, public.variantes to anon, authenticated;
grant insert, update, delete on public.categorias, public.produtos, public.produto_fotos, public.variantes to authenticated;
grant select on public.perfis to authenticated;
grant update (nome, telefone, cep, logradouro, numero, complemento, bairro, cidade, uf) on public.perfis to authenticated;

create policy "perfil próprio ou admin" on public.perfis
	for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "edita o próprio perfil" on public.perfis
	for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "categorias ativas" on public.categorias
	for select using (ativo or (select public.is_admin()));
create policy "produtos ativos" on public.produtos
	for select using (ativo or (select public.is_admin()));
create policy "fotos de produtos visíveis" on public.produto_fotos
	for select using (exists (select 1 from public.produtos p where p.id = produto_id));
create policy "variantes ativas de produtos visíveis" on public.variantes
	for select using (
		(ativo and exists (select 1 from public.produtos p where p.id = produto_id)) or (select public.is_admin())
	);

create policy "admin escreve categorias" on public.categorias
	for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin escreve produtos" on public.produtos
	for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin escreve fotos" on public.produto_fotos
	for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin escreve variantes" on public.variantes
	for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

insert into storage.buckets (id, name, public) values ('produtos', 'produtos', true);

create policy "admin envia fotos" on storage.objects
	for insert to authenticated with check (bucket_id = 'produtos' and (select public.is_admin()));
create policy "admin altera fotos" on storage.objects
	for update to authenticated using (bucket_id = 'produtos' and (select public.is_admin()));
create policy "admin apaga fotos" on storage.objects
	for delete to authenticated using (bucket_id = 'produtos' and (select public.is_admin()));

insert into public.categorias (nome, slug, ordem) values ('Moda', 'moda', 0), ('Beleza', 'beleza', 1);
insert into public.categorias (nome, slug, parent_id, ordem)
select v.nome, v.slug, (select id from public.categorias where slug = 'beleza'), v.ordem
from (values ('Maquiagem', 'maquiagem', 0), ('Skincare', 'skincare', 1), ('Perfumaria', 'perfumaria', 2)) as v (nome, slug, ordem);
