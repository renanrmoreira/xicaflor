create table public.pedidos (
	id uuid primary key default gen_random_uuid(),
	numero bigint generated always as identity unique,
	cliente_id uuid not null references public.perfis on delete restrict,
	status text not null default 'aguardando_pagamento' check (
		status in (
			'aguardando_pagamento', 'pago', 'separando', 'saiu_para_entrega', 'entregue',
			'pronto_para_retirada', 'retirado', 'cancelado', 'expirado'
		)
	),
	modalidade text not null check (modalidade in ('entrega', 'retirada')),
	frete_a_combinar boolean not null default false,
	subtotal_centavos int not null check (subtotal_centavos >= 0),
	frete_centavos int not null default 0 check (frete_centavos >= 0),
	total_centavos int generated always as (subtotal_centavos + frete_centavos) stored,
	endereco jsonb,
	mp_preference_id text,
	mp_payment_id text unique,
	reserva_expira_em timestamptz not null default now() + interval '30 minutes',
	pago_em timestamptz,
	criado_em timestamptz not null default now(),
	atualizado_em timestamptz not null default now(),
	check (modalidade = 'retirada' or endereco is not null),
	check (pg_column_size(endereco) < 2000)
);

create table public.itens_pedido (
	id uuid primary key default gen_random_uuid(),
	pedido_id uuid not null references public.pedidos on delete cascade,
	variante_id uuid not null references public.variantes on delete restrict,
	nome_produto text not null,
	cor text,
	tamanho text,
	preco_unitario_centavos int not null check (preco_unitario_centavos > 0),
	quantidade int not null check (quantidade > 0)
);

create index on public.pedidos (cliente_id);
create index on public.pedidos (status, reserva_expira_em);
create index on public.itens_pedido (pedido_id);

alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
revoke all on public.pedidos, public.itens_pedido from anon, authenticated;
grant select on public.pedidos, public.itens_pedido to authenticated;

create policy "pedidos próprios ou admin" on public.pedidos
	for select to authenticated using (cliente_id = (select auth.uid()) or (select public.is_admin()));
create policy "itens de pedidos visíveis" on public.itens_pedido
	for select to authenticated using (exists (select 1 from public.pedidos p where p.id = pedido_id));

create function public.frete_do_cep(cep text)
returns table (preco_centavos int, a_combinar boolean)
language sql
stable
set search_path = ''
as $$
	select z.preco_centavos, z.preco_centavos is null
	from public.zonas_frete z
	where z.ativo and cep between z.cep_inicio and z.cep_fim
	order by z.cep_fim::bigint - z.cep_inicio::bigint
	limit 1
$$;

create function public.criar_pedido(itens jsonb, modalidade text, endereco jsonb default null)
returns table (id uuid, numero bigint, reserva_expira_em timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
	cliente uuid := auth.uid();
	pedido public.pedidos;
	agrupados jsonb;
	v record;
	subtotal int := 0;
	frete_preco int := 0;
	frete_a_combinar boolean := false;
	cep text := regexp_replace(coalesce(endereco ->> 'cep', ''), '\D', '', 'g');
begin
	if cliente is null then
		raise exception 'login necessário' using errcode = '42501';
	end if;
	if modalidade is null or modalidade not in ('entrega', 'retirada') then
		raise exception 'modalidade inválida' using errcode = '22023';
	end if;
	if jsonb_typeof(itens) is distinct from 'array' or jsonb_array_length(itens) not between 1 and 50 then
		raise exception 'sacola vazia ou grande demais' using errcode = '22023';
	end if;
	if exists (
		select 1 from jsonb_to_recordset(itens) as x(variante_id uuid, quantidade int)
		where x.variante_id is null or x.quantidade is null or x.quantidade not between 1 and 10
	) then
		raise exception 'item inválido' using errcode = '22023';
	end if;
	if modalidade = 'entrega' and (
		length(cep) <> 8
		or coalesce(trim(endereco ->> 'logradouro'), '') = ''
		or coalesce(trim(endereco ->> 'numero'), '') = ''
		or coalesce(trim(endereco ->> 'cidade'), '') = ''
	) then
		raise exception 'endereço incompleto' using errcode = '22023';
	end if;

	select jsonb_agg(jsonb_build_object('variante_id', x.variante_id, 'quantidade', x.total) order by x.variante_id)
	into agrupados
	from (
		select y.variante_id, sum(y.quantidade)::int as total
		from jsonb_to_recordset(itens) as y(variante_id uuid, quantidade int)
		group by y.variante_id
	) x;

	if exists (
		select 1 from jsonb_to_recordset(agrupados) as i(variante_id uuid, quantidade int)
		where not exists (
			select 1 from public.variantes va join public.produtos p on p.id = va.produto_id
			where va.id = i.variante_id and va.ativo and p.ativo
		)
	) then
		raise exception 'variante indisponível' using errcode = 'P0002';
	end if;

	-- Trava as variantes sempre na mesma ordem (por id) para dois pedidos simultâneos não se travarem mutuamente.
	for v in
		select va.id, va.preco_centavos, va.estoque, p.nome, i.quantidade
		from jsonb_to_recordset(agrupados) as i(variante_id uuid, quantidade int)
		join public.variantes va on va.id = i.variante_id
		join public.produtos p on p.id = va.produto_id
		order by va.id
		for update of va
	loop
		if v.quantidade > 10 or v.estoque < v.quantidade then
			raise exception 'estoque insuficiente: %', v.nome using errcode = 'P0001', detail = v.id::text;
		end if;
		subtotal := subtotal + v.preco_centavos * v.quantidade;
	end loop;

	if modalidade = 'entrega' then
		select f.preco_centavos, f.a_combinar into frete_preco, frete_a_combinar from public.frete_do_cep(cep) f;
		if not found then
			frete_a_combinar := true;
		end if;
		endereco := endereco || jsonb_build_object('cep', cep);
	end if;

	insert into public.pedidos (cliente_id, modalidade, subtotal_centavos, frete_centavos, frete_a_combinar, endereco)
	values (
		cliente, modalidade, subtotal, coalesce(frete_preco, 0), frete_a_combinar,
		case when modalidade = 'entrega' then endereco end
	)
	returning * into pedido;

	with baixa as (
		update public.variantes va set estoque = va.estoque - i.quantidade
		from jsonb_to_recordset(agrupados) as i(variante_id uuid, quantidade int)
		where va.id = i.variante_id
		returning va.id, va.preco_centavos, va.cor, va.tamanho, va.produto_id, i.quantidade
	)
	insert into public.itens_pedido (pedido_id, variante_id, nome_produto, cor, tamanho, preco_unitario_centavos, quantidade)
	select pedido.id, b.id, p.nome, b.cor, b.tamanho, b.preco_centavos, b.quantidade
	from baixa b join public.produtos p on p.id = b.produto_id;

	return query select pedido.id, pedido.numero, pedido.reserva_expira_em;
end;
$$;

create function public.devolver_estoque(pedido uuid, novo_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
	if novo_status not in ('expirado', 'cancelado') then
		raise exception 'status inválido para devolução' using errcode = '22023';
	end if;
	update public.pedidos set status = novo_status, atualizado_em = now()
	where id = pedido
		and status in ('aguardando_pagamento', 'pago', 'separando', 'pronto_para_retirada')
		and (novo_status = 'cancelado' or status = 'aguardando_pagamento');
	if not found then
		return;
	end if;
	perform 1 from public.variantes va
	join public.itens_pedido i on i.variante_id = va.id
	where i.pedido_id = pedido
	order by va.id
	for update of va;
	update public.variantes va set estoque = va.estoque + i.quantidade
	from public.itens_pedido i
	where i.pedido_id = pedido and i.variante_id = va.id;
end;
$$;

create function public.mudar_status_pedido(pedido uuid, novo_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
	atual text;
begin
	if not public.is_admin() then
		raise exception 'apenas admin' using errcode = '42501';
	end if;
	if novo_status = 'cancelado' then
		perform public.devolver_estoque(pedido, 'cancelado');
		return;
	end if;
	select status into atual from public.pedidos where id = pedido for update;
	if not (
		(atual = 'pago' and novo_status in ('separando', 'pronto_para_retirada'))
		or (atual = 'separando' and novo_status in ('saiu_para_entrega', 'pronto_para_retirada'))
		or (atual = 'saiu_para_entrega' and novo_status = 'entregue')
		or (atual = 'pronto_para_retirada' and novo_status = 'retirado')
	) then
		raise exception 'transição inválida: % para %', atual, novo_status using errcode = '22023';
	end if;
	update public.pedidos set status = novo_status, atualizado_em = now() where id = pedido;
end;
$$;

create function public.expirar_pedidos()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
	p uuid;
	total int := 0;
begin
	for p in
		select id from public.pedidos
		where status = 'aguardando_pagamento' and reserva_expira_em < now()
		for update skip locked
	loop
		perform public.devolver_estoque(p, 'expirado');
		total := total + 1;
	end loop;
	return total;
end;
$$;

revoke execute on function public.criar_pedido(jsonb, text, jsonb) from public, anon;
grant execute on function public.criar_pedido(jsonb, text, jsonb) to authenticated;
revoke execute on function public.devolver_estoque(uuid, text), public.expirar_pedidos() from public, anon, authenticated;
revoke execute on function public.mudar_status_pedido(uuid, text) from public, anon;
grant execute on function public.mudar_status_pedido(uuid, text) to authenticated;
grant execute on function public.frete_do_cep(text) to anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('expirar-pedidos', '*/5 * * * *', 'select public.expirar_pedidos()');
