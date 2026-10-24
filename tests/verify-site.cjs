"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const pages = [
  "index.html",
  "admin/index.html",
  "admin/login.html",
  "atendimentos/index.html",
];
for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `IDs duplicados: ${page}`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|tel:|data:)/.test(url)) continue;
    if (url.startsWith("#")) {
      assert(ids.includes(url.slice(1)), `Âncora ausente: ${page} ${url}`);
      continue;
    }
    const file = url.split(/[?#]/)[0];
    let target = file.startsWith("/")
      ? file.slice(1)
      : path.join(path.dirname(page), file);
    if (target === "" || target.endsWith("/"))
      target = path.join(target, "index.html");
    assert(fs.existsSync(target), `Arquivo ausente: ${page} ${url}`);
  }
}
const admin = fs.readFileSync("admin/index.html", "utf8");
assert(!admin.includes("Cliente demonstrativo"));
assert(admin.includes("admin/documents.js"));
const docs = fs.readFileSync("admin/documents.css", "utf8");
assert(/size:\s*180mm\s+120mm/.test(docs));
const qr = fs.readFileSync("assets/labels/qr-portal.svg", "utf8");
assert(qr.includes("<svg"));
const config = JSON.parse(
  fs.readFileSync("vercel.json", "utf8").replace(/^\uFEFF/, ""),
);
assert(Array.isArray(config.headers));
console.log(
  "PASS: arquivos e âncoras locais, IDs únicos, documentos, etiqueta e configuração da hospedagem.",
);
