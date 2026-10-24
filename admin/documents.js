"use strict";
// Documentos gerados apenas a partir dos registros já salvos no painel.
window.UbaranasDocuments = (() => {
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const status = {
    rascunho: "Rascunho",
    pendente: "Pendente",
    andamento: "Em andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
  };
  function date(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : "Não informada";
  }
  const value = (text) => escape(text || "Não informado");
  function consultationUrl(order) {
    const url = new URL("/atendimentos/", window.location.origin);
    url.searchParams.set("os", order.codigoConsulta);
    return url.href;
  }
  function label(order) {
    const field = (title, text, css = "") =>
      `<div class="label-field ${css}"><strong>${escape(title)}</strong><p>${value(text)}</p></div>`;
    return `<article class="maintenance-label"><header class="label-header"><img src="${escape(new URL("/assets/logo/logo.png", window.location.origin).href)}" alt="Grupo Ubaranas"><div><b>ELÉTRICA E AUTOMAÇÃO</b><b>SEGURANÇA ELETRÔNICA · CFTV</b><span>Infraestrutura · Controle de acesso</span></div></header><h1>REGISTRO DE MANUTENÇÃO</h1><div class="label-body"><div class="label-fields">${field("Data da manutenção", date(order.dataConclusao))}${field("Próxima manutenção", date(order.proximaManutencao))}${field("Número da ordem de serviço", order.numero)}${field("Código de consulta no portal", order.codigoConsulta)}${field("Equipamento / identificação do quadro", [order.equipamento, order.marcaModelo, order.numeroSerie].filter(Boolean).join(" · "), "wide")}${field("Observações", order.observacoes, "wide notes")}${field("Técnico responsável", order.tecnico, "wide")}</div><aside class="label-contact"><h2>CENTRAL DE ATENDIMENTO</h2><p>Histórico · Garantia · Suporte</p><b>WhatsApp (21) 97743-3837</b><small>contato@grupoubaranas.com.br</small><a href="${escape(consultationUrl(order))}"><img class="qr" src="${escape(new URL("/assets/labels/qr-portal.svg", window.location.origin).href)}" alt="QR Code para acessar o Portal do Cliente"></a><p>Aponte a câmera e informe<br>o código de consulta.</p><small>grupoubaranas.com.br/atendimentos</small></aside></div><footer>NÃO REMOVA ESTA ETIQUETA. Ela identifica o registro técnico deste equipamento.</footer></article>`;
  }
  function report(order) {
    const field = (title, text) =>
      `<div class="report-field"><dt>${escape(title)}</dt><dd>${value(text)}</dd></div>`;
    const block = (title, text) =>
      `<section><h2>${escape(title)}</h2><p>${value(text)}</p></section>`;
    return `<article class="service-report"><header><strong>GRUPO UBARANAS</strong><p>Elétrica · Automação · Segurança eletrônica<br>CNPJ: 49.187.630/0001-06 · (21) 97743-3837</p></header><h1>Relatório de serviço · ${value(order.numero)}</h1><p>Emitido em ${escape(new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date()))} a partir da OS salva.</p><dl>${field("Cliente", order.cliente)}${field("Endereço do serviço", order.endereco)}${field("Serviço", order.servico)}${field("Status", status[order.status] || order.status)}${field("Equipamento", order.equipamento)}${field("Marca / modelo", order.marcaModelo)}${field("Número de série", order.numeroSerie)}${field("Técnico responsável", order.tecnico)}${field("Abertura", date(order.dataAbertura))}${field("Conclusão", date(order.dataConclusao))}${field("Próxima manutenção", date(order.proximaManutencao))}${field("Garantia até", date(order.garantiaAte))}</dl>${block("Problema relatado", order.problemaRelatado)}${block("Diagnóstico técnico", order.diagnostico)}${block("Serviços executados", order.servicoExecutado)}${block("Materiais utilizados", order.materiais)}${block("Observações", order.observacoes)}<footer>Registro dos serviços informados na OS. Este documento não constitui laudo ou certificação técnica.</footer></article>`;
  }
  function summary(orders, filters) {
    return `<article class="service-report"><header><strong>GRUPO UBARANAS</strong><p>Relatório de ordens de serviço</p></header><h1>Resumo dos atendimentos</h1><p>${orders.length} registro(s) · ${escape(filters || "Todos os registros")}</p><p>Emitido em ${escape(new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date()))}.</p><table><thead><tr><th>OS</th><th>Cliente / serviço</th><th>Status</th><th>Abertura</th><th>Próxima manutenção</th></tr></thead><tbody>${orders.map((order) => `<tr><td>${value(order.numero)}</td><td>${value(order.cliente)}<br>${value(order.servico)}</td><td>${value(status[order.status] || order.status)}</td><td>${date(order.dataAbertura)}</td><td>${date(order.proximaManutencao)}</td></tr>`).join("")}</tbody></table></article>`;
  }
  function open(content, kind, title) {
    const popup = window.open("", "_blank", "width=1000,height=800");
    if (!popup) return false;
    popup.opener = null;
    const stylesheet = new URL("/admin/documents.css", window.location.origin)
      .href;
    popup.document.open();
    popup.document.write(
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${escape(title)}</title><link rel="stylesheet" href="${escape(stylesheet)}"></head><body class="${kind === "label" ? "label-page" : "report-page"}"><div class="print-toolbar"><button type="button" id="printDocument">Imprimir / Salvar em PDF</button><p>${kind === "label" ? "Etiqueta de 18 × 12 cm. Imprima em escala 100%, sem cabeçalhos ou rodapés. Ative a impressão dos gráficos de fundo para manter as cores. Confira se o papel comporta a etiqueta. Observações extensas ficam disponíveis no relatório." : "Escolha Salvar como PDF na janela de impressão. O documento contém os dados já salvos na OS."}</p></div>${content}</body></html>`,
    );
    popup.document.close();
    popup.document
      .getElementById("printDocument")
      .addEventListener("click", async () => {
        await Promise.all(
          [...popup.document.images].map((image) =>
            image.decode().catch(() => {}),
          ),
        );
        popup.print();
      });
    return true;
  }
  return { label, report, summary, open, consultationUrl };
})();
