create function public.confirmar_pagamento(pedido uuid, pagamento text, valor_centavos int)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
	p public.pedidos;
begin
	select * into p from public.pedidos where id = pedido for update;
	if not found then
		return 'desconhecido';
	end if;
	if p.mp_payment_id = pagamento then
		return 'repetido';
	end if;
	if p.status <> 'aguardando_pagamento' then
		return 'fora_do_prazo';
	end if;
	if p.total_centavos <> valor_centavos then
		return 'valor_divergente';
	end if;
	update public.pedidos
	set status = 'pago', mp_payment_id = pagamento, pago_em = now(), atualizado_em = now()
	where id = pedido;
	return 'pago';
end;
$$;

revoke execute on function public.confirmar_pagamento(uuid, text, int) from public, anon, authenticated;
grant execute on function public.confirmar_pagamento(uuid, text, int) to service_role;
