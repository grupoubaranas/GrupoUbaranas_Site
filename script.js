// =====================================================
// Grupo Ubaranas
// Script Principal
// =====================================================
// HEADER AO ROLAR A PÁGINA
//-------------------------------------

const header = document.querySelector('.header');
if(header){
    window.addEventListener('scroll', () => {
        if(window.scrollY > 80){
            header.classList.add('header-scroll');
        } else {
            header.classList.remove('header-scroll');
        }
    });
}

// SCROLL SUAVE
//-------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e){
        e.preventDefault();
        const destino = document.querySelector(
            this.getAttribute('href')
        );
        if(destino){
            destino.scrollIntoView({
                behavior:'smooth'
            });
        }
    });
});

// MENU ATIVO
//-------------------------------------
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav ul li a');
window.addEventListener('scroll', ()=>{
    let current = "";
    sections.forEach(section=>{
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if(
            pageYOffset >= sectionTop - 150
        ){
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link=>{
        link.classList.remove('active');
        if(
            link.getAttribute('href')
            ===
            `#${current}`
        ){
            link.classList.add('active');
        }
    });
});
// BOTÃO WHATSAPP
//-------------------------------------
function abrirWhatsapp(){
    window.open(
        "https://wa.me/5521977433837",
        "_blank"
    );
}

// ANIMAÇÕES FUTURAS
//-------------------------------------

// Aqui futuramente podemos adicionar:

// Lightbox

// Carrossel

// Lazy Load

// Contadores

// AOS

// GSAP
document.addEventListener("DOMContentLoaded", () => {

  const slides = document.querySelectorAll(".slide");
  let index = 0;

  function show(i) {
    slides.forEach((s, idx) => {
      s.classList.remove("active");
      if (idx === i) s.classList.add("active");
    });
  }

  function next() {
    index = (index + 1) % slides.length;
    show(index);
  }

  show(0);
  setInterval(next, 5000);

});

});
console.log(
"Grupo Ubaranas carregado com sucesso"
);
console.log("SLIDER JS CARREGOU");

setInterval(() => {
  console.log("TICK SLIDER");
}, 1000);
