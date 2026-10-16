alter table public.categorias add column vitrine boolean not null default false
	check (not vitrine or parent_id is null);
update public.categorias set vitrine = true where slug = 'beleza';

create function public.categoria_vitrine(categoria uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
	select coalesce(r.vitrine, c.vitrine)
	from public.categorias c
	left join public.categorias r on r.id = c.parent_id
	where c.id = categoria
$$;

create function public.salvar_produto(dados jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
	produto uuid := coalesce((dados ->> 'id')::uuid, gen_random_uuid());
	base text := dados ->> 'slug';
	vitrine boolean := public.categoria_vitrine((dados ->> 'categoria_id')::uuid);
	variantes jsonb := coalesce(dados -> 'variantes', '[]');
	v jsonb;
	mantidas uuid[] := '{}';
	vid uuid;
begin
	if not public.is_admin() then
		raise exception 'apenas admin' using errcode = '42501';
	end if;
	if vitrine is null then
		raise exception 'categoria inexistente' using errcode = '23503';
	end if;
	if vitrine and jsonb_array_length(variantes) > 0 then
		raise exception 'produto de vitrine não tem variantes' using errcode = '23514';
	end if;
	if not vitrine and jsonb_array_length(variantes) = 0 then
		raise exception 'produto precisa de ao menos uma variante' using errcode = '23514';
	end if;
	if exists (select 1 from public.produtos where slug = base and id <> produto) then
		base := base || '-' || left(produto::text, 6);
	end if;

	insert into public.produtos (id, nome, slug, descricao, marca, categoria_id, ativo, destaque)
	values (
		produto, dados ->> 'nome', base, coalesce(dados ->> 'descricao', ''), nullif(dados ->> 'marca', ''),
		(dados ->> 'categoria_id')::uuid, coalesce((dados ->> 'ativo')::boolean, true),
		coalesce((dados ->> 'destaque')::boolean, false)
	)
	on conflict (id) do update set
		nome = excluded.nome, slug = excluded.slug, descricao = excluded.descricao, marca = excluded.marca,
		categoria_id = excluded.categoria_id, ativo = excluded.ativo, destaque = excluded.destaque;

	for v in select * from jsonb_array_elements(variantes) loop
		vid := (v ->> 'id')::uuid;
		if vid is null then
			select id into vid from public.variantes
			where produto_id = produto
				and cor is not distinct from nullif(v ->> 'cor', '')
				and tamanho is not distinct from nullif(v ->> 'tamanho', '');
		end if;
		insert into public.variantes (id, produto_id, cor, tamanho, preco_centavos, estoque, ativo)
		values (
			coalesce(vid, gen_random_uuid()), produto, nullif(v ->> 'cor', ''),
			nullif(v ->> 'tamanho', ''), (v ->> 'preco_centavos')::int, (v ->> 'estoque')::int, true
		)
		on conflict (id) do update set
			cor = excluded.cor, tamanho = excluded.tamanho, preco_centavos = excluded.preco_centavos,
			estoque = excluded.estoque, ativo = true
		returning id into vid;
		mantidas := mantidas || vid;
	end loop;

	update public.variantes set ativo = false where produto_id = produto and id <> all (mantidas);
	return produto;
end;
$$;

create function public.ajustar_estoque(variante uuid, delta int)
returns int
language plpgsql
set search_path = ''
as $$
declare
	novo int;
begin
	if not public.is_admin() then
		raise exception 'apenas admin' using errcode = '42501';
	end if;
	update public.variantes set estoque = estoque + delta where id = variante returning estoque into novo;
	return novo;
end;
$$;

revoke execute on function public.salvar_produto(jsonb), public.ajustar_estoque(uuid, int) from public, anon;
grant execute on function public.salvar_produto(jsonb), public.ajustar_estoque(uuid, int) to authenticated;
