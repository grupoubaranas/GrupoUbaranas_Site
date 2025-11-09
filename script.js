// Script simples para abrir WhatsApp links com mensagem e disparar evento FB (se configurado)
const phone = "5521977433837"; // substitua com DDI+DDD+NUM (ex: 5511999999999)
const baseText = encodeURIComponent("Olá Grupo Ubaranas, quero agendar uma avaliação.");

function makeWA() {
  return `https://wa.me/${phone}?text=${baseText}`;
}

// atribui aos botões whatsapp
document.querySelectorAll('.whatsapp').forEach(el=>{
  el.href = makeWA();
  el.addEventListener('click', ()=> {
    // evento FB: Lead (se fbq existir)
    try{ if(window.fbq) fbq('track','Lead'); }catch(e){}
  });
});
document.querySelectorAll('#whatsapp-hero, #whatsapp-problemas, #whatsapp-portfolio, .footer .whatsapp, .nav .cta').forEach(el=>{
  el.href = makeWA();
  el.addEventListener('click', ()=> { try{ if(window.fbq) fbq('track','Lead'); }catch(e){} });
});
