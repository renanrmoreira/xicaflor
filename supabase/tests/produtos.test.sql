begin;
select plan(9);

insert into auth.users (id, email) values
	('00000000-0000-0000-0000-00000000000a', 'admin@teste.local'),
	('00000000-0000-0000-0000-00000000000c', 'cliente@teste.local');
update public.perfis set papel = 'admin' where id = '00000000-0000-0000-0000-00000000000a';
insert into public.categorias (id, nome, slug, parent_id) values
	('00000000-0000-0000-0000-0000000000c1', 'Vestidos', 'vestidos', (select id from public.categorias where slug = 'moda'));

set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}';
select throws_ok($$ select public.salvar_produto('{"nome":"X","slug":"x","categoria_id":"00000000-0000-0000-0000-0000000000c1","variantes":[{"tamanho":"M","preco_centavos":100,"estoque":1}]}') $$, '42501', null, 'cliente não salva produto');

set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
select lives_ok($$ select public.salvar_produto('{"id":"00000000-0000-0000-0000-0000000000b1","nome":"Vestido Ipê","slug":"vestido-ipe","categoria_id":"00000000-0000-0000-0000-0000000000c1","variantes":[{"tamanho":"P","preco_centavos":18990,"estoque":2},{"tamanho":"M","preco_centavos":18990,"estoque":3}]}') $$, 'admin cria produto com variantes num passo');
select is((select count(*)::int from public.variantes where produto_id = '00000000-0000-0000-0000-0000000000b1'), 2, 'duas variantes criadas');

select public.salvar_produto('{"id":"00000000-0000-0000-0000-0000000000b1","nome":"Vestido Ipê","slug":"vestido-ipe","categoria_id":"00000000-0000-0000-0000-0000000000c1","variantes":[{"tamanho":"M","preco_centavos":17990,"estoque":5}]}');
select is((select count(*)::int from public.variantes where produto_id = '00000000-0000-0000-0000-0000000000b1' and ativo), 1, 'variante removida do formulário fica inativa');
select is((select preco_centavos from public.variantes where produto_id = '00000000-0000-0000-0000-0000000000b1' and tamanho = 'M'), 17990, 'variante existente é atualizada pelo par cor/tamanho');

select throws_ok($$ select public.salvar_produto(jsonb_build_object('nome', 'Batom', 'slug', 'batom', 'categoria_id', (select id from public.categorias where slug = 'maquiagem'), 'variantes', jsonb_build_array(jsonb_build_object('preco_centavos', 100, 'estoque', 1)))) $$, '23514', null, 'vitrine não aceita variantes');
select lives_ok($$ select public.salvar_produto(jsonb_build_object('nome', 'Batom', 'slug', 'batom', 'marca', 'OULAB', 'categoria_id', (select id from public.categorias where slug = 'maquiagem'))) $$, 'vitrine salva só nome, descrição e marca');

select is(public.ajustar_estoque((select id from public.variantes where produto_id = '00000000-0000-0000-0000-0000000000b1' and tamanho = 'M'), -2), 3, 'ajuste de estoque soma o delta');
select throws_ok($$ select public.ajustar_estoque((select id from public.variantes where produto_id = '00000000-0000-0000-0000-0000000000b1' and tamanho = 'M'), -10) $$, '23514', null, 'ajuste não deixa estoque negativo');

select * from finish();
rollback;
