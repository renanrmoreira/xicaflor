begin;
select plan(13);

insert into auth.users (id, email, raw_user_meta_data)
values
	('00000000-0000-0000-0000-00000000000a', 'admin@teste.local', '{"nome":"Admin"}'),
	('00000000-0000-0000-0000-00000000000c', 'cliente@teste.local', '{"nome":"Cliente"}');
update public.perfis set papel = 'admin' where id = '00000000-0000-0000-0000-00000000000a';

insert into public.produtos (id, nome, slug, categoria_id, ativo) values
	('00000000-0000-0000-0000-0000000000b1', 'Vestido ativo', 'vestido-ativo', (select id from public.categorias where slug = 'moda'), true),
	('00000000-0000-0000-0000-0000000000b2', 'Vestido oculto', 'vestido-oculto', (select id from public.categorias where slug = 'moda'), false);
insert into public.variantes (produto_id, tamanho, preco_centavos, estoque) values
	('00000000-0000-0000-0000-0000000000b1', 'M', 18990, 2),
	('00000000-0000-0000-0000-0000000000b2', 'M', 18990, 2);

select is((select count(*)::int from public.categorias where parent_id is null), 2, 'seed tem as raízes Moda e Beleza');
select ok((select perfis.nome = 'Cliente' from public.perfis where id = '00000000-0000-0000-0000-00000000000c'), 'trigger cria o perfil no cadastro');
select throws_ok($$ update public.variantes set estoque = -1 $$, '23514', null, 'estoque nunca fica negativo');
select throws_ok($$ update public.categorias set link_vitrine = 'https://loja.exemplo.com' where slug = 'maquiagem' $$, '23514', null, 'link da vitrine só na categoria raiz');

set local role anon;
select is((select count(*)::int from public.produtos), 1, 'anônimo vê só produto ativo');
select is((select count(*)::int from public.variantes), 1, 'anônimo não vê variante de produto oculto');
select throws_ok($$ insert into public.categorias (nome, slug) values ('X', 'x') $$, '42501', null, 'anônimo não escreve categoria');
select throws_ok($$ update public.produtos set nome = 'hack' $$, '42501', null, 'anônimo não altera produto');

set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}';
select throws_ok($$ update public.perfis set papel = 'admin' where id = auth.uid() $$, '42501', null, 'cliente não altera o próprio papel');
select lives_ok($$ update public.perfis set telefone = '91999990000' where id = auth.uid() $$, 'cliente edita o próprio telefone');
select throws_ok($$ insert into public.produtos (nome, slug, categoria_id) values ('X', 'x', (select id from public.categorias limit 1)) $$, '42501', null, 'cliente não cria produto');

set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
select is((select count(*)::int from public.produtos), 2, 'admin vê produto oculto');
select lives_ok($$ update public.categorias set link_vitrine = 'https://loja.exemplo.com' where slug = 'beleza' $$, 'admin define link da vitrine na raiz Beleza');

select * from finish();
rollback;
