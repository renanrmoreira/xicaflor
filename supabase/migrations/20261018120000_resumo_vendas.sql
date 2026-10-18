create function public.resumo_vendas(referencia timestamptz default now())
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
	hoje date := (referencia at time zone 'America/Belem')::date;
	inicio_mes timestamptz := date_trunc('month', hoje)::date::timestamp at time zone 'America/Belem';
	fim_mes timestamptz := (date_trunc('month', hoje)::date + interval '1 month')::timestamp at time zone 'America/Belem';
begin
	if not public.is_admin() then
		raise exception 'apenas admin' using errcode = '42501';
	end if;
	return (
		select jsonb_build_object(
			'dia_centavos', coalesce(sum(total_centavos) filter (where dia = hoje), 0),
			'dia_pedidos', count(*) filter (where dia = hoje),
			'mes_centavos', coalesce(sum(total_centavos), 0),
			'mes_pedidos', count(*),
			'por_status', (
				select coalesce(jsonb_object_agg(status, n), '{}')
				from (select status, count(*) as n from public.pedidos group by status) s
			)
		)
		from (
			select total_centavos, (pago_em at time zone 'America/Belem')::date as dia
			from public.pedidos
			where status not in ('cancelado', 'expirado')
				and pago_em >= inicio_mes and pago_em < fim_mes
		) p
	);
end;
$$;

revoke execute on function public.resumo_vendas(timestamptz) from public, anon;
grant execute on function public.resumo_vendas(timestamptz) to authenticated;
