"use strict";
window.UbaranasQuoteMath = (() => {
  function units(value, scale) {
    const text=String(value).trim();
    if (!new RegExp(`^\\d+(?:\\.\\d{1,${scale}})?$`).test(text)) throw new Error("Informe quantidades e valores válidos, sem notação científica.");
    const [whole,fraction=""]=text.split(".");
    return BigInt(whole)*10n**BigInt(scale)+BigInt(fraction.padEnd(scale,"0"));
  }
  function calculate(items) {
    if (!Array.isArray(items)||!items.length||items.length>100) throw new Error("Informe entre 1 e 100 itens.");
    let cents=0n;
    const normalized=items.map(item=>{
      const description=String(item.descricao||"").trim();
      const qty=units(item.quantidade,3),price=units(item.valor_unitario,2);
      if(!description||description.length>500||qty<1n||qty>1000000000n||price>1000000000n)throw new Error("Revise a descrição, quantidade e valor unitário dos itens.");
      const total=(qty*price+500n)/1000n;cents+=total;
      return{descricao:description,quantidade:Number(qty)/1000,valor_unitario:Number(price)/100,total_centavos:Number(total)};
    });
    if(cents>999999999999n)throw new Error("O total excede o limite permitido.");
    return{items:normalized,total:Number(cents)/100};
  }
  return{calculate,money:value=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value)};
})();
window.UbaranasQuotes = (() => {
 let context,quotes=[],saving=false;
 const math=window.UbaranasQuoteMath;
 const escape=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
 const open=order=>["rascunho","pendente","andamento"].includes(order.status);
 const byId=id=>document.getElementById(id);
 function refreshOrders(){
  if(!context)return;
  const select=byId("quoteOrder"),selected=select.value;
  select.innerHTML='<option value="">Selecione uma OS em aberto</option>'+context.getOrders().filter(open).map(order=>`<option value="${escape(order.id)}">${escape(order.numero)} · ${escape(order.cliente)} · ${escape(order.servico)}</option>`).join("");
  select.value=selected;
  if(quotes.length)render();
 }
 function addItem(item={descricao:"",quantidade:1,valor_unitario:0}){
  if(byId("quoteItems").children.length>=100)return;
  const row=document.createElement("div");row.className="quote-item-row";
  row.innerHTML=`<div class="quote-description"><label>Descrição do item<input class="form-control" data-field="descricao" required maxlength="500" aria-label="Descrição do item" value="${escape(item.descricao)}"></label></div><div><label>Quantidade<input class="form-control" data-field="quantidade" type="number" min="0.001" max="1000000" step="0.001" required aria-label="Quantidade" value="${escape(item.quantidade)}"></label></div><div><label>Valor unitário (R$)<input class="form-control" data-field="valor_unitario" type="number" min="0" max="10000000" step="0.01" required aria-label="Valor unitário" value="${escape(item.valor_unitario)}"></label></div><button type="button" class="btn btn-secondary" data-remove-item aria-label="Remover item">Remover</button>`;
  byId("quoteItems").append(row);updateTotal();
 }
 function readItems(){return[...byId("quoteItems").children].map(row=>Object.fromEntries([...row.querySelectorAll("[data-field]")].map(input=>[input.dataset.field,input.value])));}
 function updateTotal(){try{byId("quoteTotal").textContent=math.money(math.calculate(readItems()).total)}catch{byId("quoteTotal").textContent="Preencha os itens para calcular";}}
 function reset(){
  byId("quoteForm").reset();byId("quoteId").value="";byId("quoteItems").replaceChildren();
  const validity=new Date();validity.setDate(validity.getDate()+15);byId("quoteValidity").value=`${validity.getFullYear()}-${String(validity.getMonth()+1).padStart(2,"0")}-${String(validity.getDate()).padStart(2,"0")}`;
  byId("quoteOrder").disabled=false;refreshOrders();addItem();
 }
 async function load(){
  const {data,error}=await window.supabaseClient.from("orcamentos").select("*").order("criado_em",{ascending:false});
  if(error){byId("quoteList").textContent="Não foi possível carregar os orçamentos. Use Atualizar para tentar novamente.";return;}
  quotes=data||[];render();
 }
 function render(){
  byId("quoteList").innerHTML=quotes.length?quotes.map(quote=>{
   const order=context.getOrders().find(order=>order.id===quote.ordem_id);
   return `<article class="quote-card"><header><h4>${escape(quote.numero)}</h4><strong>${math.money(quote.total)}</strong></header><p>${escape(quote.cliente)} · ${escape(order?.numero||"OS vinculada")}</p><p>Cadastrado por: ${escape(quote.criado_por_nome)} · Validade: ${escape(String(quote.validade).split("-").reverse().join("/"))}</p><button class="btn btn-secondary" type="button" data-quote-action="pdf" data-quote-id="${escape(quote.id)}">Proposta / PDF</button>${order&&open(order)?`<button class="btn btn-secondary" type="button" data-quote-action="edit" data-quote-id="${escape(quote.id)}">Editar orçamento</button>`:""}</article>`;
  }).join(""):"<p class=\"document-help\">Nenhum orçamento cadastrado. Abra uma OS para iniciar uma proposta.</p>";
 }
 async function save(event){
  event.preventDefault();if(saving)return;
  try{
   const calculated=math.calculate(readItems());const orderId=byId("quoteOrder").value;
   if(!context.getOrders().some(order=>order.id===orderId&&open(order)))throw new Error("Selecione uma OS em aberto.");
   const payload={ordem_id:orderId,validade:byId("quoteValidity").value,itens:calculated.items.map(({descricao,quantidade,valor_unitario})=>({descricao,quantidade,valor_unitario})),observacoes:byId("quoteNotes").value.trim()||null};
   saving=true;byId("saveQuote").disabled=true;
   const id=byId("quoteId").value;
   const query=id?window.supabaseClient.from("orcamentos").update(payload).eq("id",id):window.supabaseClient.from("orcamentos").insert(payload);
   const{error}=await query.select("*").single();
   if(error)throw new Error("Não foi possível salvar. Verifique se a OS continua em aberto e se sua conta possui permissão.");
   await load();reset();context.notify("Orçamento salvo","O total e a autoria foram registrados no banco.","success");
  }catch(error){context.notify("Revise o orçamento",error.message,"warning");}
  finally{saving=false;byId("saveQuote").disabled=false;}
 }
 function proposal(quote){
  const order=context.getOrders().find(order=>order.id===quote.ordem_id);
  const calculated=math.calculate(quote.itens);
  return `<article class="service-report"><header><strong>GRUPO UBARANAS</strong><p>Elétrica · Automação · Segurança eletrônica<br>CNPJ: 49.187.630/0001-06 · (21) 97743-3837</p></header><h1>Orçamento / proposta · ${escape(quote.numero)}</h1><dl><div class="report-field"><dt>Cliente</dt><dd>${escape(quote.cliente)}</dd></div><div class="report-field"><dt>OS de referência</dt><dd>${escape(order?.numero||"OS vinculada")}</dd></div><div class="report-field"><dt>Serviço</dt><dd>${escape(quote.servico)}</dd></div><div class="report-field"><dt>Validade</dt><dd>${escape(String(quote.validade).split("-").reverse().join("/"))}</dd></div></dl><table><thead><tr><th>Descrição</th><th>Qtd.</th><th>Valor unitário</th><th>Total</th></tr></thead><tbody>${calculated.items.map(item=>`<tr><td>${escape(item.descricao)}</td><td>${escape(item.quantidade)}</td><td>${math.money(item.valor_unitario)}</td><td>${math.money(item.total_centavos/100)}</td></tr>`).join("")}</tbody></table><h2>Total: ${math.money(quote.total)}</h2>${quote.observacoes?`<section><h2>Observações e condições</h2><p>${escape(quote.observacoes)}</p></section>`:""}<footer>Elaborado por ${escape(quote.criado_por_nome)}. Valores referentes aos itens discriminados nesta proposta.</footer></article>`;
 }
 async function init(options){
  context=options;
  byId("addQuoteItem").addEventListener("click",()=>addItem());
  byId("quoteItems").addEventListener("input",updateTotal);
  byId("quoteItems").addEventListener("click",event=>{const button=event.target.closest("[data-remove-item]");if(button){button.closest(".quote-item-row").remove();updateTotal();}});
  byId("resetQuote").addEventListener("click",reset);byId("quoteForm").addEventListener("submit",save);
  byId("quoteList").addEventListener("click",event=>{
   const button=event.target.closest("[data-quote-action]");if(!button)return;
   const quote=quotes.find(quote=>quote.id===button.dataset.quoteId);if(!quote)return;
   if(button.dataset.quoteAction==="pdf"){
    if(!window.UbaranasDocuments.open(proposal(quote),"report",`Proposta ${quote.numero}`))context.notify("Janela bloqueada","Permita a abertura da proposta para imprimir ou salvar em PDF.","warning");
   }else{
    reset();byId("quoteId").value=quote.id;byId("quoteOrder").value=quote.ordem_id;byId("quoteOrder").disabled=true;byId("quoteValidity").value=quote.validade;byId("quoteNotes").value=quote.observacoes||"";byId("quoteItems").replaceChildren();quote.itens.forEach(addItem);byId("quoteEditor").open=true;byId("quoteEditor").scrollIntoView({behavior:"smooth",block:"start"});
   }
  });
  reset();await load();
 }
 return{init,refreshOrders,load};
})();
