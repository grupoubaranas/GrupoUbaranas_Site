"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const message=document.getElementById("activationMessage"),button=document.getElementById("validateInvite"),form=document.getElementById("activationForm"),save=document.getElementById("savePassword");
 const fragment=new URLSearchParams(window.location.hash.slice(1));
 const token=fragment.get("token_hash");
 const type=fragment.get("type") === "recovery" ? "recovery" : "invite";
 // O token sai da barra de endereço antes de qualquer interação ou navegação.
 window.history.replaceState(null,"",window.location.pathname);
 button.addEventListener("click",async()=>{
  if(!token){message.textContent="Convite ausente. Solicite um link de ativação ao administrador.";return;}
  button.disabled=true;
  try{
   const {data,error}=await window.supabaseClient.auth.verifyOtp({token_hash:token,type});
   if(error||!data.user)throw new Error();
   button.hidden=true;form.hidden=false;message.textContent="Convite validado. Defina uma senha que só você conheça.";document.getElementById("newPassword").focus();
  }catch{message.textContent="Este convite é inválido, já foi usado ou expirou. Solicite uma nova ativação ao administrador.";button.disabled=false;}
 });
 form.addEventListener("submit",async event=>{
  event.preventDefault();const password=document.getElementById("newPassword").value,confirmation=document.getElementById("confirmPassword").value;
  if(password.length<12||password!==confirmation){message.textContent="Use ao menos 12 caracteres e confirme a mesma senha nos dois campos.";return;}
  save.disabled=true;
  try{
   const {error}=await window.supabaseClient.auth.updateUser({password});if(error)throw new Error();
   form.reset();form.hidden=true;await window.supabaseClient.auth.signOut({scope:"local"});message.textContent="Senha definida. Acesse o painel com seu e-mail e sua nova senha.";
  }catch{message.textContent="Não foi possível definir a senha. Confira a conexão e tente novamente.";save.disabled=false;}
 });
});
