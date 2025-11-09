// Este arquivo é reservado para scripts de funcionalidades.
// O Facebook Pixel Base Code já foi incluído no index.html para garantir o carregamento mais rápido.

// Adicione aqui qualquer script para rastrear eventos específicos do Pixel.
// Por exemplo, rastrear um clique no botão de WhatsApp:

document.addEventListener('DOMContentLoaded', () => {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach( button => {
        button.addEventListener('click', () => {
            // Rastreamento de um evento de Lead customizado no clique do CTA
            if ( typeof fbq === 'function') {
                fbq('track', 'Lead', {
                    content_name: 'Manutencao_Eletrica_WhatsApp',
                    value: 1.00, // Valor simbólico de 1.00 para o Lead
                    currency: 'BRL'
                });
                console.log('Evento de Lead do Facebook Pixel disparado!');
            }
        });
    });
});

