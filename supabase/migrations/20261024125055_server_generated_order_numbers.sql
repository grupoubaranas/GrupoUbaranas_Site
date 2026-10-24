create sequence private.numero_os_seq;
revoke all on sequence private.numero_os_seq from public, anon, authenticated;
select setval('private.numero_os_seq',
 greatest(coalesce((select max((substring(numero from '^OS-[0-9]{4}-([0-9]{1,9})$'))::bigint) from public.ordens_servico),0)+1,1),false);

create or replace function private.registrar_autoria_os() returns trigger
language plpgsql security definer set search_path=''
as $$
declare actor uuid := auth.uid(); actor_nome text;
begin
 if actor is not null then
  select nome into actor_nome from public.equipe_usuarios where id=actor and ativo;
  if actor_nome is null then raise exception 'Usuário não habilitado para registrar serviços' using errcode='42501'; end if;
 else actor_nome:='Operação do sistema';
 end if;
 if TG_OP='INSERT' then
  loop
   new.numero:='OS-'||extract(year from current_date)::text||'-'||lpad(nextval('private.numero_os_seq')::text,4,'0');
   exit when not exists(select 1 from public.ordens_servico where numero=new.numero);
  end loop;
  new.criado_por:=actor; new.criado_por_nome:=actor_nome; new.criado_em:=now();
 else
  new.numero:=old.numero; new.criado_por:=old.criado_por;
  new.criado_por_nome:=old.criado_por_nome; new.criado_em:=old.criado_em;
 end if;
 new.atualizado_por:=actor; new.atualizado_por_nome:=actor_nome; new.atualizado_em:=now();
 return new;
end $$;
revoke all on function private.registrar_autoria_os() from public, anon, authenticated;
