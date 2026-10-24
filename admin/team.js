"use strict";
window.UbaranasTeam=(()=>{
 const byId=id=>document.getElementById(id);
 const escape=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
 async function load(){const{data,error}=await window.supabaseClient.from("equipe_usuarios").select("id,nome,papel,ativo").order("criado_em",{ascending:true});byId("teamList").innerHTML=error?"Não foi possível carregar a equipe.":(data||[]).map(user=>`<div class="team-row"><strong>${escape(user.nome)}</strong> · ${user.papel==="administrador"?"Administrador":"Técnico"} · ${user.ativo?"Habilitado":"Desativado"}${user.papel==="tecnico"&&user.ativo?` <button class="btn btn-secondary" type="button" data-reissue="${escape(user.id)}">Gerar nova ativação</button>`:""}</div>`).join("");}
 async function init(profile){
  if(profile.papel!=="administrador")return;
  byId("copyActivation").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(byId("activationLink").value);byId("teamMessage").textContent="Link copiado. Encaminhe somente ao técnico correspondente."}catch{byId("teamMessage").textContent="Não foi possível copiar. Permita o uso da área de transferência e tente novamente."}});
  byId("teamForm").addEventListener("submit",async event=>{
   event.preventDefault();const button=byId("createTechnician");button.disabled=true;byId("activationResult").hidden=true;byId("activationLink").value="";byId("teamMessage").textContent="Criando acesso...";
   try{
    const{data,error}=await window.supabaseClient.functions.invoke("create-technician",{body:{nome:byId("teamName").value.trim(),email:byId("teamEmail").value.trim(),papel:"tecnico"}});
    if(error||!data?.ok)throw new Error(data?.error||"Não foi possível criar a conta. Confira se o e-mail já está cadastrado e se sua sessão continua válida.");
    byId("activationLink").value=data.activation_url;byId("activationResult").hidden=false;byId("teamMessage").textContent=`Conta de ${data.nome} criada com perfil Técnico. Copie o link privado abaixo e encaminhe diretamente a ele. Nenhum e-mail foi enviado automaticamente.`;await load();
   }catch(error){byId("teamMessage").textContent=error.message;}
   finally{button.disabled=false;}
  });
  byId("teamList").addEventListener("click",async event=>{
   const button=event.target.closest("[data-reissue]");if(!button)return;button.disabled=true;byId("activationResult").hidden=true;byId("activationLink").value="";byId("teamMessage").textContent="Gerando nova ativação...";
   try{const{data,error}=await window.supabaseClient.functions.invoke("create-technician",{body:{action:"activation",id:button.dataset.reissue}});if(error||!data?.ok)throw new Error("Não foi possível gerar a nova ativação. Tente novamente.");byId("activationLink").value=data.activation_url;byId("activationResult").hidden=false;byId("teamMessage").textContent=`Nova ativação de ${data.nome} gerada. Encaminhe o link privado somente a ele.`;}catch(error){byId("teamMessage").textContent=error.message;}finally{button.disabled=false;}
  });
  await load();
 }
 return{init};
})();
