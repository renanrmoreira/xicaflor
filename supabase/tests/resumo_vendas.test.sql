begin;
select plan(5);

insert into auth.users (id, email) values
	('00000000-0000-0000-0000-0000000000c1', 'c1@teste.local'),
	('00000000-0000-0000-0000-0000000000ad', 'admin@teste.local');
update public.perfis set papel = 'admin' where id = '00000000-0000-0000-0000-0000000000ad';
insert into public.pedidos (cliente_id, modalidade, subtotal_centavos, status, pago_em) values
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 10000, 'pago', now()),
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 5000, 'retirado', now()),
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 7000, 'cancelado', now()),
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 9000, 'retirado', now() - interval '40 days'),
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 3000, 'aguardando_pagamento', null);

set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}';
select throws_ok($$ select public.resumo_vendas() $$, '42501', null, 'cliente não vê o resumo');

set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000ad","role":"authenticated"}';
select is((public.resumo_vendas() ->> 'dia_centavos')::int, 15000, 'vendas do dia ignoram cancelado e não pagos');
select is((public.resumo_vendas() ->> 'dia_pedidos')::int, 2, 'conta os pedidos pagos do dia');
select is(public.resumo_vendas() -> 'pendentes', '{"aguardando_pagamento": 1, "pago": 1}'::jsonb, 'pendentes por status');

select is((public.resumo_vendas() ->> 'mes_centavos')::int, 15000, 'mês não inclui o mês anterior');
select * from finish();
rollback;
