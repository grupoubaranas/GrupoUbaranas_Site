"use strict";
const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");
const nodes = {};
function node() {
  return {
    value: "",
    disabled: false,
    innerHTML: "",
    textContent: "",
    style: {},
    attributes: {},
    setAttribute(k, v) {
      this.attributes[k] = v;
    },
    focus() {
      this.focused = true;
    },
    scrollIntoView() {},
    addEventListener() {},
  };
}
for (const id of [
  "numeroOS",
  "btnConsultar",
  "resultado",
  "dadosOS",
  "statusOS",
  "cardGarantia",
])
  nodes[id] = node();
let requests = 0,
  data = null,
  error = null,
  history = "",
  timer;
const context = {
  document: {
    getElementById: (id) => nodes[id],
    readyState: "loading",
    addEventListener() {},
    querySelector: () => null,
  },
  window: {
    location: {
      href: "https://grupoubaranas.com.br/atendimentos/",
      search: "",
    },
    history: {
      replaceState(a, b, url) {
        history = url;
      },
    },
    setTimeout(handler) {
      timer = handler;
      return 1;
    },
    clearTimeout() {
      timer = null;
    },
    supabaseClient: {
      rpc(name, args) {
        requests++;
        assert.equal(name, "consultar_ordem_publica");
        return {
          abortSignal(signal) {
            return Promise.resolve({ data, error });
          },
        };
      },
    },
  },
  URL,
  URLSearchParams,
  Intl,
  Date,
  AbortController,
  console,
};
vm.runInNewContext(
  fs.readFileSync("atendimentos/atendimentos.js", "utf8"),
  context,
);
(async () => {
  await context.consultarOrdemDeServico();
  assert.equal(requests, 0);
  assert(nodes.dadosOS.innerHTML.includes("Digite o código"));
  nodes.numeroOS.value = "<script>";
  await context.consultarOrdemDeServico();
  assert.equal(requests, 0);
  nodes.numeroOS.value = "ABCDEF0123456789ABCDEF01";
  data = [
    {
      numero: "OS-TESTE",
      codigo_consulta: nodes.numeroOS.value,
      cliente: "<img src=x onerror=alert(1)>",
      status: "concluida",
      servico_executado: "Inspeção",
      data_conclusao: "2026-10-24",
    },
  ];
  await context.consultarOrdemDeServico();
  assert.equal(requests, 1);
  assert(nodes.dadosOS.innerHTML.includes("&lt;img"));
  assert(!nodes.dadosOS.innerHTML.includes("<img src=x"));
  assert(history.includes("?os="));
  assert(!nodes.btnConsultar.disabled);
  assert.equal(nodes.resultado.attributes["aria-busy"], "false");
  data = [];
  await context.consultarOrdemDeServico();
  assert(nodes.dadosOS.innerHTML.includes("Não encontramos"));
  assert(!history.includes("?os="));
  error = { message: "Falha simulada" };
  await context.consultarOrdemDeServico();
  assert(nodes.dadosOS.innerHTML.includes("Não foi possível acessar"));
  assert(!nodes.btnConsultar.disabled);
  assert.equal(context.formatarData("2026-02-31"), "Não informada");
  assert.equal(context.formatarData("2026-10-24"), "24/10/2026");
  console.log(
    "PASS: consulta vazia, código inválido, consulta válida, escape HTML, link, não encontrado, erro de rede, recuperação do botão e datas.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
