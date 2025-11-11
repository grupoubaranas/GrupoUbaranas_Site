// ==== SCROLL SUAVE ====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: "smooth",
      });
    }
  });
});

// ==== REVEAL AO ROLAR ====
function revelarAoRolar() {
  const elementos = document.querySelectorAll(".text-block, .imagem-ilustrativa, .titulo-perigo, .titulo-atenção");
  const alturaTela = window.innerHeight;

  elementos.forEach(el => {
    const topoElemento = el.getBoundingClientRect().top;
    if (topoElemento < alturaTela * 0.85) {
      el.classList.add("visivel");
    }
  });
}

window.addEventListener("scroll", revelarAoRolar);
document.addEventListener("DOMContentLoaded", revelarAoRolar);

// ==== EFEITO DE ENTRADA (CSS) ====
const style = document.createElement('style');
style.textContent = `
  .text-block, .imagem-ilustrativa, .titulo-perigo, .titulo-atenção {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease;
  }
  .visivel {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// ==== BOTÃO FIXO WHATSAPP ====
const btnWhatsApp = document.createElement("a");
btnWhatsApp.href = "https://wa.me/5551999999999"; // coloque aqui o número oficial
btnWhatsApp.target = "_blank";
btnWhatsApp.classList.add("whatsapp-fixo");
btnWhatsApp.innerHTML = `
  <img src="images/whatsapp-icon.png" alt="WhatsApp Grupo Ubaranas">
`;

document.body.appendChild(btnWhatsApp);

// ==== ESTILO DO BOTÃO FIXO ====
const styleBtn = document.createElement("style");
styleBtn.textContent = `
  .whatsapp-fixo {
    position: fixed;
    bottom: 25px;
    right: 25px;
    z-index: 9999;
    width: 65px;
    height: 65px;
    border-radius: 50%;
    background-color: #25d366;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: transform 0.3s ease;
  }
  .whatsapp-fixo:hover {
    transform: scale(1.1);
  }
  .whatsapp-fixo img {
    width: 40px;
    height: 40px;
  }
`;
document.head.appendChild(styleBtn);
