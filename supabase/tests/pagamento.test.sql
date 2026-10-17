begin;
select plan(8);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1', 'c1@teste.local');
insert into public.pedidos (id, cliente_id, modalidade, subtotal_centavos, frete_centavos, endereco) values
	('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000c1', 'entrega', 10000, 1500, '{}'),
	('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000c1', 'retirada', 5000, 0, null);
update public.pedidos set status = 'expirado' where id = '00000000-0000-0000-0000-0000000000e2';

set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}';
select throws_ok(
	$$ select public.confirmar_pagamento('00000000-0000-0000-0000-0000000000e1', 'pg-1', 11500) $$,
	'42501', null, 'cliente não confirma o próprio pagamento'
);

set local role service_role;
select is(public.confirmar_pagamento('00000000-0000-0000-0000-0000000000e1', 'pg-1', 9999), 'valor_divergente', 'valor diferente do total não paga');
select is(public.confirmar_pagamento('00000000-0000-0000-0000-0000000000e1', 'pg-1', 11500), 'pago', 'pagamento aprovado marca o pedido como pago');
select results_eq(
	$$ select status, mp_payment_id, pago_em is not null from public.pedidos where id = '00000000-0000-0000-0000-0000000000e1' $$,
	$$ values ('pago', 'pg-1', true) $$,
	'grava o pagamento e a data'
);
select is(public.confirmar_pagamento('00000000-0000-0000-0000-0000000000e1', 'pg-1', 11500), 'repetido', 'notificação repetida é idempotente');
select is(public.confirmar_pagamento('00000000-0000-0000-0000-0000000000e1', 'pg-2', 11500), 'fora_do_prazo', 'segundo pagamento do mesmo pedido não sobrescreve');
select is(public.confirmar_pagamento('00000000-0000-0000-0000-0000000000e2', 'pg-3', 5000), 'fora_do_prazo', 'pedido expirado não volta a pago');
select is(public.confirmar_pagamento(gen_random_uuid(), 'pg-4', 1), 'desconhecido', 'pedido inexistente é ignorado');

select * from finish();
rollback;
