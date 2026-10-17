create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.perfis (id, nome, telefone)
	values (new.id, new.raw_user_meta_data ->> 'nome', nullif(new.raw_user_meta_data ->> 'telefone', ''));
	return new;
end;
$$;
