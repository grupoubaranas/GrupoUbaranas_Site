create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.equipe_usuarios (
 id uuid primary key references auth.users(id) on delete cascade,
 nome text not null check(length(btrim(nome)) between 1 and 100),
 papel text not null default 'tecnico' check(papel in ('administrador','tecnico')),
 ativo boolean not null default true,
 criado_em timestamptz not null default now()
);
alter table public.equipe_usuarios enable row level security;
revoke all on public.equipe_usuarios from anon, authenticated;
grant select, insert, update on public.equipe_usuarios to authenticated;

-- Preserva o administrador autorizado pelas políticas que já existiam,
-- sem atribuir privilégios a todos os usuários de Auth.
do $$
declare root_id uuid;
begin
 select (regexp_match(qual,'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'))[1]::uuid
 into root_id from pg_policies
 where schemaname='public' and tablename='ordens_servico'
 and policyname='Administrador pode visualizar ordens';
 if root_id is null then raise exception 'Administrador existente não identificado'; end if;
 insert into public.equipe_usuarios(id,nome,papel)
 select id,coalesce(nullif(raw_user_meta_data->>'full_name',''),nullif(raw_user_meta_data->>'name',''),'Administrador'),'administrador'
 from auth.users where id=root_id;
 if not found then raise exception 'Conta administradora não localizada'; end if;
end $$;

create function private.equipe_papel() returns text
language sql stable security definer set search_path=''
as $$ select papel from public.equipe_usuarios where id=(select auth.uid()) and ativo is true $$;
revoke all on function private.equipe_papel() from public, anon;
grant execute on function private.equipe_papel() to authenticated;

create policy equipe_ler on public.equipe_usuarios for select to authenticated
using (id=(select auth.uid()) or (select private.equipe_papel())='administrador');
create policy equipe_cadastrar on public.equipe_usuarios for insert to authenticated
with check ((select private.equipe_papel())='administrador');
create policy equipe_editar on public.equipe_usuarios for update to authenticated
using ((select private.equipe_papel())='administrador')
with check ((select private.equipe_papel())='administrador');

alter table public.ordens_servico
 add column criado_por uuid references auth.users(id) on delete set null,
 add column criado_por_nome text,
 add column atualizado_por uuid references auth.users(id) on delete set null,
 add column atualizado_por_nome text;
create index ordens_servico_criado_por_idx on public.ordens_servico(criado_por);

create function private.registrar_autoria_os() returns trigger
language plpgsql security definer set search_path=''
as $$
declare actor uuid := auth.uid(); actor_nome text;
begin
 if actor is not null then
  select nome into actor_nome from public.equipe_usuarios where id=actor and ativo;
  if actor_nome is null then raise exception 'Usuário não habilitado para registrar serviços' using errcode='42501'; end if;
 else
  actor_nome := 'Operação do sistema';
 end if;
 if TG_OP='INSERT' then
  new.criado_por:=actor; new.criado_por_nome:=actor_nome;
 else
  new.criado_por:=old.criado_por; new.criado_por_nome:=old.criado_por_nome;
 end if;
 new.atualizado_por:=actor; new.atualizado_por_nome:=actor_nome;
 return new;
end $$;
revoke all on function private.registrar_autoria_os() from public, anon, authenticated;
create trigger autoria_ordens_servico before insert or update on public.ordens_servico
for each row execute function private.registrar_autoria_os();

create policy equipe_ler_ordens on public.ordens_servico for select to authenticated
using ((select private.equipe_papel())='administrador'
 or ((select private.equipe_papel())='tecnico' and criado_por=(select auth.uid())));
create policy equipe_cadastrar_ordens on public.ordens_servico for insert to authenticated
with check ((select private.equipe_papel()) in ('administrador','tecnico') and criado_por=(select auth.uid()));
create policy equipe_editar_ordens on public.ordens_servico for update to authenticated
using ((select private.equipe_papel())='administrador'
 or ((select private.equipe_papel())='tecnico' and criado_por=(select auth.uid()) and status in ('rascunho','pendente','andamento')))
with check ((select private.equipe_papel())='administrador'
 or ((select private.equipe_papel())='tecnico' and criado_por=(select auth.uid())));
create policy equipe_excluir_ordens on public.ordens_servico for delete to authenticated
using ((select private.equipe_papel())='administrador');

create table public.orcamentos (
 id uuid primary key default gen_random_uuid(),
 numero text not null unique default ('ORC-'||extract(year from current_date)::text||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
 ordem_id uuid not null references public.ordens_servico(id) on delete restrict,
 cliente text not null,
 servico text not null,
 validade date not null default (current_date+15),
 itens jsonb not null check(jsonb_typeof(itens)='array' and jsonb_array_length(itens) between 1 and 100),
 total numeric(12,2) not null default 0 check(total>=0),
 observacoes text,
 criado_por uuid not null references auth.users(id),
 criado_por_nome text not null,
 atualizado_por uuid references auth.users(id),
 atualizado_por_nome text,
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now()
);
alter table public.orcamentos enable row level security;
revoke all on public.orcamentos from anon, authenticated;
grant select, insert, update, delete on public.orcamentos to authenticated;
create index orcamentos_criado_por_idx on public.orcamentos(criado_por);
create index orcamentos_ordem_id_idx on public.orcamentos(ordem_id);

create function private.validar_orcamento() returns trigger
language plpgsql security definer set search_path=''
as $$
declare actor uuid := auth.uid(); actor_papel text; actor_nome text; os public.ordens_servico%rowtype;
 item jsonb; normalized jsonb:='[]'; qty numeric; price numeric; amount numeric:=0; descricao text;
begin
 if actor is null then raise exception 'Autenticação obrigatória' using errcode='42501'; end if;
 select papel,nome into actor_papel,actor_nome from public.equipe_usuarios where id=actor and ativo;
 if actor_papel is null then raise exception 'Usuário não habilitado' using errcode='42501'; end if;
 if TG_OP='UPDATE' then
  new.ordem_id:=old.ordem_id; new.criado_por:=old.criado_por; new.criado_por_nome:=old.criado_por_nome;
  new.numero:=old.numero; new.criado_em:=old.criado_em;
  if actor_papel<>'administrador' and old.criado_por<>actor then raise exception 'Orçamento de outro usuário' using errcode='42501'; end if;
 end if;
 select * into os from public.ordens_servico where id=new.ordem_id for share;
 if not found or os.status not in ('rascunho','pendente','andamento') then raise exception 'Selecione uma OS em aberto'; end if;
 if actor_papel<>'administrador' and os.criado_por is distinct from actor then raise exception 'OS de outro usuário' using errcode='42501'; end if;
 if new.validade is null or new.validade<current_date then raise exception 'Informe uma validade a partir de hoje'; end if;
 if jsonb_typeof(new.itens)<>'array' or jsonb_array_length(new.itens) not between 1 and 100 then raise exception 'Informe de 1 a 100 itens'; end if;
 for item in select * from jsonb_array_elements(new.itens) loop
  descricao:=btrim(item->>'descricao');
  qty:=(item->>'quantidade')::numeric;
  price:=(item->>'valor_unitario')::numeric;
  if descricao is null or length(descricao) not between 1 and 500 or qty is null or qty not between 0.001 and 1000000 or price is null or price not between 0 and 10000000 then raise exception 'Item de orçamento inválido'; end if;
  qty:=round(qty,3); price:=round(price,2);
  amount:=amount+round(qty*price,2);
  normalized:=normalized||jsonb_build_array(jsonb_build_object('descricao',descricao,'quantidade',qty,'valor_unitario',price));
 end loop;
 new.itens:=normalized; new.total:=amount;
 new.cliente:=os.cliente; new.servico:=os.servico;
 if TG_OP='INSERT' then new.criado_por:=actor; new.criado_por_nome:=actor_nome; end if;
 new.atualizado_por:=actor; new.atualizado_por_nome:=actor_nome; new.atualizado_em:=now();
 return new;
end $$;
revoke all on function private.validar_orcamento() from public, anon, authenticated;
create trigger validar_orcamento before insert or update on public.orcamentos for each row execute function private.validar_orcamento();
create policy orcamentos_ler on public.orcamentos for select to authenticated
using ((select private.equipe_papel())='administrador'
 or ((select private.equipe_papel())='tecnico' and criado_por=(select auth.uid())));
create policy orcamentos_cadastrar on public.orcamentos for insert to authenticated
with check ((select private.equipe_papel()) in ('administrador','tecnico') and criado_por=(select auth.uid()));
create policy orcamentos_editar on public.orcamentos for update to authenticated
using ((select private.equipe_papel())='administrador'
 or ((select private.equipe_papel())='tecnico' and criado_por=(select auth.uid())))
with check ((select private.equipe_papel())='administrador'
 or ((select private.equipe_papel())='tecnico' and criado_por=(select auth.uid())));
create policy orcamentos_excluir on public.orcamentos for delete to authenticated
using ((select private.equipe_papel())='administrador');
