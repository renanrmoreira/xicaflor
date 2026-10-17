begin;
select plan(17);

insert into auth.users (id, email) values
	('00000000-0000-0000-0000-0000000000c1', 'c1@teste.local'),
	('00000000-0000-0000-0000-0000000000c2', 'c2@teste.local');
insert into public.categorias (id, nome, slug, parent_id) values
	('00000000-0000-0000-0000-0000000000a1', 'Saias', 'saias', (select id from public.categorias where slug = 'moda'));
insert into public.produtos (id, nome, slug, categoria_id) values
	('00000000-0000-0000-0000-0000000000b1', 'Saia Flor', 'saia-flor', '00000000-0000-0000-0000-0000000000a1');
insert into public.variantes (id, produto_id, tamanho, preco_centavos, estoque) values
	('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000b1', 'P', 10000, 1),
	('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000b1', 'M', 12000, 5);

set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}';

select throws_ok(
	$$ insert into public.pedidos (cliente_id, modalidade, subtotal_centavos) values (auth.uid(), 'retirada', 1) $$,
	'42501', null, 'cliente não insere pedido direto'
);

select lives_ok(
	$$ select public.criar_pedido('[{"variante_id":"00000000-0000-0000-0000-0000000000d2","quantidade":1},{"variante_id":"00000000-0000-0000-0000-0000000000d2","quantidade":2}]', 'entrega', '{"cep":"66060-000","logradouro":"Rua A"}') $$,
	'cria pedido com entrega em Belém'
);
select is((select estoque from public.variantes where id = '00000000-0000-0000-0000-0000000000d2'), 2, 'baixa agrupa linhas repetidas da mesma variante');
select results_eq(
	$$ select subtotal_centavos, frete_centavos, total_centavos, frete_a_combinar from public.pedidos where cliente_id = auth.uid() $$,
	$$ values (36000, 0, 36000, false) $$,
	'preço vem do banco e frete de Belém é grátis'
);
select is((select quantidade from public.itens_pedido limit 1), 3, 'item gravado com a quantidade somada');

select throws_ok(
	$$ select public.criar_pedido('[{"variante_id":"00000000-0000-0000-0000-0000000000d2","quantidade":3}]', 'retirada') $$,
	'P0001', null, 'estoque insuficiente aborta'
);
select is((select estoque from public.variantes where id = '00000000-0000-0000-0000-0000000000d2'), 2, 'nada muda quando aborta');

select lives_ok(
	$$ select public.criar_pedido('[{"variante_id":"00000000-0000-0000-0000-0000000000d1","quantidade":1}]', 'entrega', '{"cep":"66910010"}') $$,
	'cria pedido para Mosqueiro'
);
select is(
	(select frete_a_combinar from public.pedidos where cliente_id = auth.uid() order by numero desc limit 1),
	true, 'Mosqueiro fica com frete a combinar'
);
select throws_ok(
	$$ select public.criar_pedido('[{"variante_id":"00000000-0000-0000-0000-0000000000d1","quantidade":1}]', 'retirada') $$,
	'P0001', null, 'última peça já reservada não é vendida de novo'
);
select throws_ok(
	$$ select public.criar_pedido('[{"variante_id":"00000000-0000-0000-0000-0000000000d2","quantidade":1}]', 'entrega', '{"cep":"123"}') $$,
	'22023', null, 'entrega exige CEP válido'
);
select throws_ok($$ select public.expirar_pedidos() $$, '42501', null, 'cliente não roda a expiração');

set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000c2","role":"authenticated"}';
select is((select count(*)::int from public.pedidos), 0, 'outro cliente não vê pedidos alheios');
select is_empty($$ update public.pedidos set status = 'pago' returning id $$, 'cliente não muda status de pedido');

reset role;
update public.pedidos set reserva_expira_em = now() - interval '1 minute' where cliente_id = '00000000-0000-0000-0000-0000000000c1';
select is(public.expirar_pedidos(), 2, 'expira os dois pedidos vencidos');
select results_eq(
	$$ select estoque from public.variantes where produto_id = '00000000-0000-0000-0000-0000000000b1' order by tamanho desc $$,
	$$ values (1), (5) $$,
	'expiração devolve todo o estoque'
);

select isnt_empty($$ select 1 from cron.job where jobname = 'expirar-pedidos' and schedule = '*/5 * * * *' $$, 'expiração agendada a cada 5 minutos');

select * from finish();
rollback;
