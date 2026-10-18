create function public.resumo_vendas()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
	hoje date := (now() at time zone 'America/Belem')::date;
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
			'pendentes', (
				select coalesce(jsonb_object_agg(status, n), '{}')
				from (
					select status, count(*) as n from public.pedidos
					where status in ('aguardando_pagamento', 'pago', 'separando', 'saiu_para_entrega', 'pronto_para_retirada')
					group by status
				) s
			)
		)
		from (
			select total_centavos, (pago_em at time zone 'America/Belem')::date as dia
			from public.pedidos
			where pago_em is not null
				and status not in ('cancelado', 'expirado')
				and pago_em >= date_trunc('month', hoje)::timestamp at time zone 'America/Belem'
		) p
	);
end;
$$;

revoke execute on function public.resumo_vendas() from public, anon;
grant execute on function public.resumo_vendas() to authenticated;
