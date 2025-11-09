// Este arquivo é reservado para scripts de funcionalidades.

document.addEventListener('DOMContentLoaded', () => {
  const ctaButtons = document.querySelectorAll('.cta-button');

  ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Rastreamento de evento de Lead customizado no clique do CTA
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          content_name: 'Manutencao_Eletrica_WhatsApp',
          value: 1.00,
          currency: 'BRL'
        });
        console.log('Evento de Lead do Facebook Pixel disparado!');
      }
    });
  });
});
