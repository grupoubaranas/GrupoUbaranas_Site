// Script simples para comportamento suave dos botões e destaque visual
document.querySelectorAll('a[href^="https://wa.me"]').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.style.boxShadow = "0 0 10px rgba(37, 211, 102, 0.8)";
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.boxShadow = "none";
    });
});
