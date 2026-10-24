import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const allowedOrigins = new Set([
  "https://grupoubaranas.com.br",
  "https://www.grupoubaranas.com.br",
  "https://grupo-ubarana-git-8ec6ab-felipe-augusto-silva-da-rosas-projects.vercel.app",
]);
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const cors = {
    "Access-Control-Allow-Origin": origin || "https://grupoubaranas.com.br",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Cache-Control": "no-store",
  };
  const reply = (status: number, body: object) => new Response(JSON.stringify(body), {status, headers:{...cors,"Content-Type":"application/json"}});
  if (origin && !allowedOrigins.has(origin)) return reply(403,{error:"Origem não permitida."});
  if (req.method === "OPTIONS") return new Response(null,{status:204,headers:cors});
  if (req.method !== "POST") return reply(405,{error:"Método não permitido."});
  const authorization = req.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return reply(401,{error:"Entre com a conta administradora."});
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return reply(503,{error:"Configuração do serviço indisponível."});
  // Autenticação própria: a assinatura e a validade do token são verificadas pelo Auth.
  // Nenhuma chave privilegiada é retornada ao navegador.
  const service = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data: auth, error: authError} = await service.auth.getUser(token);
  if (authError || !auth.user) return reply(401,{error:"Sessão inválida ou expirada."});
  const {data: profile, error: profileError} = await service.from("equipe_usuarios").select("papel,ativo").eq("id",auth.user.id).single();
  if (profileError || profile?.papel !== "administrador" || !profile.ativo) return reply(403,{error:"Somente o administrador pode criar técnicos."});
  let body;
  try {body = await req.json();} catch {return reply(400,{error:"Dados inválidos."});}
  let nome=String(body.nome||"").trim();
  let email=String(body.email||"").trim().toLowerCase();
  let type: "invite" | "recovery" = "invite";
  const reissue=body.action === "activation";
  if (reissue) {
    const id=String(body.id||"");
    if (!/^[0-9a-f-]{36}$/.test(id)) return reply(400,{error:"Conta inválida."});
    const {data:target,error:targetError}=await service.from("equipe_usuarios").select("nome,papel,ativo").eq("id",id).single();
    if(targetError||target?.papel!=="tecnico"||!target.ativo)return reply(403,{error:"Selecione uma conta de técnico habilitada."});
    const {data:account,error:accountError}=await service.auth.admin.getUserById(id);
    if(accountError||!account.user?.email)return reply(404,{error:"Conta não localizada."});
    nome=target.nome;email=account.user.email;type=account.user.email_confirmed_at?"recovery":"invite";
  }
  if(nome.length<1||nome.length>100||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return reply(400,{error:"Informe nome e e-mail válidos."});
  if(body.papel&&body.papel!=="tecnico")return reply(400,{error:"Este fluxo cria somente contas de técnico."});
  // O segredo de uso único é entregue somente ao administrador autenticado.
  const {data,error}=type==="invite"
    ?await service.auth.admin.generateLink({type:"invite",email,options:{data:{full_name:nome}}})
    :await service.auth.admin.generateLink({type:"recovery",email});
  if(error||!data.user||!data.properties?.hashed_token)return reply(400,{error:"Não foi possível gerar a ativação. Confira se essa conta já existe ou solicite uma nova ativação na lista da equipe."});
  if(!reissue){
    const {error:saveError}=await service.from("equipe_usuarios").insert({id:data.user.id,nome,papel:"tecnico",ativo:true});
    if(saveError)return reply(500,{error:"A conta foi criada, mas o perfil não foi habilitado. Solicite suporte antes de tentar novamente."});
  }
  const activation=new URL("https://grupoubaranas.com.br/admin/ativar-conta.html");
  activation.hash=new URLSearchParams({token_hash:data.properties.hashed_token,type}).toString();
  return reply(200,{ok:true,nome,email,activation_url:activation.href});
});
