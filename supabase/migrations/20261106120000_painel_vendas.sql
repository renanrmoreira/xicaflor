create function public.painel_vendas(referencia timestamptz default now())
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
	hoje date := (referencia at time zone 'America/Belem')::date;
begin
	if not public.is_admin() then
		raise exception 'apenas admin' using errcode = '42501';
	end if;
	return jsonb_build_object(
		'semana', (
			select jsonb_agg(jsonb_build_object('dia', d.dia::date, 'centavos', coalesce(v.total, 0)) order by d.dia)
			from generate_series(hoje - 6, hoje, interval '1 day') as d(dia)
			left join (
				select (pago_em at time zone 'America/Belem')::date as dia, sum(total_centavos) as total
				from public.pedidos
				where status not in ('cancelado', 'expirado')
					and pago_em >= (hoje - 6)::timestamp at time zone 'America/Belem'
				group by 1
			) v on v.dia = d.dia::date
		),
		'mais_vendidos', (
			select coalesce(jsonb_agg(jsonb_build_object('nome', nome, 'quantidade', qtd) order by qtd desc), '[]')
			from (
				select i.nome_produto as nome, sum(i.quantidade) as qtd
				from public.itens_pedido i
				join public.pedidos p on p.id = i.pedido_id
				where p.status not in ('cancelado', 'expirado')
					and p.pago_em >= referencia - interval '30 days'
				group by 1
				order by 2 desc
				limit 5
			) t
		)
	);
end;
$$;

revoke execute on function public.painel_vendas(timestamptz) from public, anon;
grant execute on function public.painel_vendas(timestamptz) to authenticated;
