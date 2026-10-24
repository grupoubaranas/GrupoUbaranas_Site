-- Consulta pública por código aleatório. O número sequencial da OS não é credencial.
-- A função SECURITY DEFINER é intencional: expõe somente os campos de atendimento
-- de uma OS liberada, sem conceder SELECT na tabela ao visitante.
alter table public.ordens_servico alter column codigo_consulta set default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 24));

create or replace function public.consultar_ordem_publica(p_codigo text)
returns table (
 numero text, codigo_consulta text, data_abertura date, cliente text,
 categoria text, servico text, status text, prioridade text, tecnico text,
 equipamento text, marca_modelo text, problema_relatado text, diagnostico text,
 servico_executado text, materiais text, observacoes text, data_conclusao date,
 proxima_manutencao date, garantia_ate date
)
language sql stable security definer set search_path = ''
as $function$
 select os.numero, os.codigo_consulta, os.data_abertura, os.cliente,
 os.categoria, os.servico, os.status, os.prioridade, os.tecnico,
 os.equipamento, os.marca_modelo, os.problema_relatado, os.diagnostico,
 os.servico_executado, os.materiais, os.observacoes, os.data_conclusao,
 os.proxima_manutencao, os.garantia_ate
 from public.ordens_servico os
 where os.visivel_no_portal is true
 and length(btrim(p_codigo)) between 10 and 64
 and upper(btrim(p_codigo)) ~ '^[A-Z0-9-]+$'
 and os.codigo_consulta = upper(btrim(p_codigo))
 limit 1;
$function$;

alter function public.atualizar_data_modificacao() set search_path = '';
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.atualizar_data_modificacao() from public, anon, authenticated;
revoke execute on function public.consultar_ordem_publica(text) from public, anon, authenticated;
grant execute on function public.consultar_ordem_publica(text) to anon, authenticated;
revoke truncate, references, trigger on table public.ordens_servico from authenticated;
