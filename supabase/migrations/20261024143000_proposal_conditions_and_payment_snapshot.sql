-- Dados bancários são configurados no banco, nunca no código público.
create table private.proposta_pagamento (
 singleton boolean primary key default true check(singleton),
 dados jsonb not null check(jsonb_typeof(dados)='object')
);
alter table private.proposta_pagamento enable row level security;
revoke all on private.proposta_pagamento from public,anon,authenticated;
alter table public.orcamentos
 add column condicoes jsonb not null default '{}'::jsonb check(jsonb_typeof(condicoes)='object' and octet_length(condicoes::text)<=30000),
 add column dados_pagamento jsonb not null default '{}'::jsonb;
create function private.preparar_dados_proposta() returns trigger
language plpgsql security definer set search_path=''
as $$
begin
 if TG_OP='INSERT' then
  select dados into new.dados_pagamento from private.proposta_pagamento where singleton;
  new.dados_pagamento:=coalesce(new.dados_pagamento,'{}'::jsonb);
 else
  new.dados_pagamento:=old.dados_pagamento;
 end if;
 return new;
end $$;
revoke all on function private.preparar_dados_proposta() from public,anon,authenticated;
create trigger preparar_dados_proposta before insert or update on public.orcamentos
for each row execute function private.preparar_dados_proposta();
