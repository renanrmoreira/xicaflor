create function public.registrar_preferencia(pedido uuid, preferencia text)
returns void
language sql
security definer
set search_path = ''
as $$
	update public.pedidos set mp_preference_id = preferencia, atualizado_em = now()
	where id = pedido and cliente_id = auth.uid() and status = 'aguardando_pagamento'
$$;

revoke execute on function public.registrar_preferencia(uuid, text) from public, anon;
grant execute on function public.registrar_preferencia(uuid, text) to authenticated;
