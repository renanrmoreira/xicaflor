begin;
select plan(6);

insert into auth.users (id, email) values
	('00000000-0000-0000-0000-0000000000c1', 'c1@teste.local'),
	('00000000-0000-0000-0000-0000000000ad', 'admin@teste.local');
update public.perfis set papel = 'admin' where id = '00000000-0000-0000-0000-0000000000ad';
insert into public.pedidos (cliente_id, modalidade, subtotal_centavos, status, pago_em) values
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 10000, 'pago', '2026-10-15 23:30-03'),
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 5000, 'retirado', '2026-10-15 08:00-03'),
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 7000, 'cancelado', '2026-10-15 09:00-03'),
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 2000, 'retirado', '2026-10-01 00:30-03'),
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 9000, 'retirado', '2026-10-01 02:30Z'),
	('00000000-0000-0000-0000-0000000000c1', 'retirada', 3000, 'aguardando_pagamento', null);

set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}';
select throws_ok($$ select public.resumo_vendas() $$, '42501', null, 'cliente não vê o resumo');

set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000ad","role":"authenticated"}';
select is((public.resumo_vendas('2026-10-16 02:00Z') ->> 'dia_centavos')::int, 15000, 'dia segue o fuso de Belém e ignora cancelado');
select is((public.resumo_vendas('2026-10-16 02:00Z') ->> 'dia_pedidos')::int, 2, 'conta os pedidos pagos do dia');
select is((public.resumo_vendas('2026-10-16 02:00Z') ->> 'mes_centavos')::int, 17000, 'mês começa à meia-noite de Belém');
select is((public.resumo_vendas('2026-09-30 12:00-03') ->> 'mes_centavos')::int, 9000, '02:30Z de 1º/10 ainda é setembro em Belém');
select is((public.resumo_vendas() -> 'por_status' ->> 'aguardando_pagamento')::int, 1, 'contagem por status');

select * from finish();
rollback;
