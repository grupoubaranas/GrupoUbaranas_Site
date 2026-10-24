"use strict";
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
let html = "",
  printHandler;
const popup = {
  opener: {},
  document: {
    open() {},
    write(value) {
      html = value;
    },
    close() {},
    images: [],
    getElementById() {
      return {
        addEventListener(type, handler) {
          printHandler = handler;
        },
      };
    },
  },
  print() {
    this.printed = true;
  },
};
const context = {
  window: {
    location: { origin: "https://grupoubaranas.com.br" },
    open: () => popup,
  },
  URL,
  Intl,
  console,
};
vm.runInNewContext(fs.readFileSync("admin/documents.js", "utf8"), context);
const docs = context.window.UbaranasDocuments;
const order = {
  numero: "OS-TESTE",
  codigoConsulta: "COD-TESTE",
  visivelNoPortal: true,
  cliente: "<img src=x onerror=alert(1)>",
  equipamento: "Quadro A",
  servicoExecutado: "Inspeção\nOrganização",
  status: "concluida",
  dataAbertura: "2026-10-24",
  dataConclusao: "2026-10-24",
  observacoes: "<script>alert(1)</script>",
  tecnico: "Equipe de teste",
};
assert(docs.report(order).includes("&lt;img src=x onerror=alert(1)&gt;"));
assert(!docs.report(order).includes("<img src=x"));
assert(docs.report(order).includes("24/10/2026"));
assert(docs.report(order).includes("Inspeção\nOrganização"));
assert(docs.label(order).includes("/assets/labels/qr-portal.svg"));
assert(docs.label(order).includes("COD-TESTE"));
assert(!docs.label(order).includes(order.cliente));
assert(!docs.label(order).includes("<script>"));
assert.equal(
  docs.consultationUrl({ ...order, codigoConsulta: "A&B" }),
  "https://grupoubaranas.com.br/atendimentos/?os=A%26B",
);
assert(
  docs.summary([order], "Busca: <script>").includes("Busca: &lt;script&gt;"),
);
assert(docs.open(docs.report(order), "report", order.numero));
assert.equal(popup.opener, null);
assert(html.includes("/admin/documents.css"));
const source = fs
  .readFileSync("admin/admin.js", "utf8")
  .replace(/\}\)\(\);\s*$/, "globalThis.testApi = {printSavedOrder}; })();");
context.document = { addEventListener() {} };
vm.runInNewContext(source, context);
context.window.open = () => {
  throw Error("Etiqueta privada não deve abrir");
};
context.testApi.printSavedOrder({ ...order, visivelNoPortal: false }, "label");
(async () => {
  await printHandler();
  assert(popup.printed);
  console.log(
    "PASS: relatório, resumo, etiqueta, QR local, escape HTML, datas, link codificado, impressão e bloqueio de etiqueta privada.",
  );
})();
