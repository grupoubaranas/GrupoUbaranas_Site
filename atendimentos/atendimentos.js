/* ==========================================================
   GRUPO UBARANAS
   PORTAL DO CLIENTE — JAVASCRIPT V2.0
   Arquivo: atendimentos/atendimentos.js
   Consulta pública pelo Supabase
========================================================== */

"use strict";

const campoNumeroOS = document.getElementById("numeroOS");
const botaoConsultar = document.getElementById("btnConsultar");
const areaResultado = document.getElementById("resultado");
const areaDadosOS = document.getElementById("dadosOS");
const areaStatusOS = document.getElementById("statusOS");
const cardGarantia = document.getElementById("cardGarantia");


/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

async function inicializarPortal() {
    if (
        !campoNumeroOS ||
        !botaoConsultar ||
        !areaResultado ||
        !areaDadosOS ||
        !areaStatusOS
    ) {
        console.error(
            "Elementos obrigatórios do portal não foram encontrados no HTML."
        );

        return;
    }

    campoNumeroOS.addEventListener(
        "input",
        formatarCampoOS
    );

    campoNumeroOS.addEventListener(
        "keydown",
        consultarComEnter
    );

    botaoConsultar.addEventListener(
        "click",
        consultarOrdemDeServico
    );

    if (cardGarantia) {
        cardGarantia.addEventListener(
            "click",
            abrirConsultaGarantia
        );
    }

    if (!window.supabaseClient) {
        botaoConsultar.disabled = true;

        mostrarErro(
            "Não foi possível conectar ao sistema de consulta. " +
            "Atualize a página e tente novamente."
        );

        console.error(
            "supabaseClient não foi encontrado."
        );

        return;
    }

    await consultarOSPelaURL();
}


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        inicializarPortal
    );
} else {
    inicializarPortal();
}


/* ==========================================================
   FORMATAÇÃO DO CAMPO
========================================================== */

function formatarCampoOS(evento) {
    evento.target.value = evento.target.value
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9-]/g, "");
}


function normalizarCodigo(valor) {
    return String(valor || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");
}


/* ==========================================================
   CONSULTA
========================================================== */

function consultarComEnter(evento) {
    if (evento.key === "Enter") {
        evento.preventDefault();

        consultarOrdemDeServico();
    }
}


async function consultarOrdemDeServico(evento) {
    if (evento) {
        evento.preventDefault();
    }

    const codigo = normalizarCodigo(
        campoNumeroOS.value
    );

    limparResultado();

    if (!codigo) {
        mostrarErro(
            "Digite o código de consulta da Ordem de Serviço."
        );

        campoNumeroOS.focus();

        return;
    }

    alterarEstadoConsulta(true);

    try {
        const {
            data,
            error
        } = await window.supabaseClient.rpc(
            "consultar_ordem_publica",
            {
                p_codigo: codigo
            }
        );

        if (error) {
            throw error;
        }

        const ordem = Array.isArray(data)
            ? data[0]
            : data;

        if (!ordem) {
            mostrarErro(
                `Não encontramos uma Ordem de Serviço para o código ${codigo}. ` +
                "Confira o código e tente novamente."
            );

            atualizarEnderecoURL("");

            return;
        }

        exibirOrdemDeServico(ordem);

        atualizarEnderecoURL(
            ordem.codigo_consulta || codigo
        );
    } catch (erro) {
        console.error(
            "Erro ao consultar a Ordem de Serviço:",
            erro
        );

        mostrarErro(
            "Não foi possível acessar o sistema de consulta neste momento. " +
            "Tente novamente mais tarde ou entre em contato pelo WhatsApp."
        );
    } finally {
        alterarEstadoConsulta(false);
    }
}


function alterarEstadoConsulta(carregando) {
    botaoConsultar.disabled = carregando;
    campoNumeroOS.disabled = carregando;

    if (carregando) {
        botaoConsultar.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Consultando
        `;

        return;
    }

    botaoConsultar.innerHTML = `
        <i class="fa-solid fa-magnifying-glass"></i>
        Consultar
    `;
}


/* ==========================================================
   EXIBIÇÃO DA ORDEM
========================================================== */

function exibirOrdemDeServico(ordem) {
    const status = calcularStatus(
        ordem.status,
        ordem.proxima_manutencao
    );

    exibirStatus(status);

    areaDadosOS.innerHTML = `
        <div class="os-cabecalho">

            <div>

                <h3>
                    ${escaparHTML(
                        formatarCategoria(
                            ordem.categoria
                        )
                    )}
                </h3>

                <p>
                    ${escaparHTML(
                        ordem.servico ||
                        "Informações do serviço realizado."
                    )}
                </p>

            </div>

            <span class="os-numero">

                <i class="fa-solid fa-file-circle-check"></i>

                ${escaparHTML(
                    ordem.numero ||
                    "OS não informada"
                )}

            </span>

        </div>


        <div class="os-grade">

            ${criarItemOS(
                "Cliente",
                ordem.cliente ||
                "Não informado"
            )}

            ${criarItemOS(
                "Equipamento",
                ordem.equipamento ||
                "Não informado"
            )}

            ${criarItemOS(
                "Marca ou modelo",
                ordem.marca_modelo ||
                "Não informado"
            )}

            ${criarItemOS(
                "Data de abertura",
                formatarData(
                    ordem.data_abertura
                )
            )}

            ${criarItemOS(
                "Data de conclusão",
                formatarData(
                    ordem.data_conclusao
                )
            )}

            ${criarItemOS(
                "Próxima manutenção",
                formatarData(
                    ordem.proxima_manutencao
                )
            )}

            ${criarItemOS(
                "Garantia",
                criarTextoGarantia(
                    ordem.garantia_ate
                )
            )}

            ${criarItemOS(
                "Técnico responsável",
                ordem.tecnico ||
                "Não informado"
            )}

            ${criarItemOS(
                "Status da OS",
                formatarStatus(
                    ordem.status
                )
            )}

            ${criarItemOS(
                "Prioridade",
                formatarPrioridade(
                    ordem.prioridade
                )
            )}

        </div>


        ${criarBlocoTexto(
            "Problema relatado",
            "fa-solid fa-circle-exclamation",
            ordem.problema_relatado
        )}


        ${criarBlocoTexto(
            "Diagnóstico técnico",
            "fa-solid fa-magnifying-glass",
            ordem.diagnostico
        )}


        <div class="os-bloco">

            <h3>

                <i class="fa-solid fa-screwdriver-wrench"></i>

                Serviços executados

            </h3>

            ${criarListaServicos(
                ordem.servico_executado
            )}

        </div>


        ${criarBlocoTexto(
            "Materiais utilizados",
            "fa-solid fa-toolbox",
            ordem.materiais
        )}


        ${criarBlocoTexto(
            "Observações técnicas",
            "fa-solid fa-clipboard-list",
            ordem.observacoes
        )}
    `;

    areaResultado.style.display = "block";

    areaResultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ==========================================================
   COMPONENTES DO RESULTADO
========================================================== */

function criarItemOS(titulo, valor) {
    return `
        <div class="os-item">

            <span>
                ${escaparHTML(titulo)}
            </span>

            <strong>
                ${escaparHTML(valor)}
            </strong>

        </div>
    `;
}


function criarBlocoTexto(
    titulo,
    icone,
    texto
) {
    const conteudo = String(
        texto || ""
    ).trim();

    if (!conteudo) {
        return "";
    }

    return `
        <div class="os-bloco">

            <h3>

                <i class="${escaparHTML(icone)}"></i>

                ${escaparHTML(titulo)}

            </h3>

            <p>
                ${formatarTextoComQuebras(
                    conteudo
                )}
            </p>

        </div>
    `;
}


function criarListaServicos(valor) {
    const texto = String(
        valor || ""
    ).trim();

    if (!texto) {
        return `
            <p>
                Nenhum serviço detalhado foi registrado.
            </p>
        `;
    }

    const itens = texto
        .split(/\r?\n|;\s*/)
        .map((item) => item.trim())
        .filter(Boolean);

    if (itens.length === 1) {
        return `
            <p>
                ${escaparHTML(itens[0])}
            </p>
        `;
    }

    const lista = itens
        .map((item) => {
            return `
                <li>
                    ${escaparHTML(item)}
                </li>
            `;
        })
        .join("");

    return `
        <ul>
            ${lista}
        </ul>
    `;
}


/* ==========================================================
   STATUS DA ORDEM E MANUTENÇÃO
========================================================== */

function calcularStatus(
    statusSalvo,
    proximaManutencao
) {
    const status = String(
        statusSalvo || ""
    ).toLowerCase();

    if (status === "cancelada") {
        return {
            tipo: "vencida",

            titulo:
                "Ordem de Serviço cancelada",

            mensagem:
                "Entre em contato com nossa equipe para mais informações.",

            icone:
                "fa-solid fa-circle-xmark"
        };
    }

    if (
        status === "pendente" ||
        status === "andamento" ||
        status === "rascunho"
    ) {
        return {
            tipo: "atencao",

            titulo:
                status === "andamento"
                    ? "Atendimento em andamento"
                    : "Atendimento pendente",

            mensagem:
                "As informações desta Ordem de Serviço ainda estão sendo atualizadas.",

            icone:
                "fa-solid fa-clock"
        };
    }

    const dataManutencao = converterDataISO(
        proximaManutencao
    );

    if (!dataManutencao) {
        return {
            tipo: "em-dia",

            titulo:
                "Serviço concluído",

            mensagem:
                "O atendimento desta Ordem de Serviço foi concluído.",

            icone:
                "fa-solid fa-circle-check"
        };
    }

    const hoje = obterDataAtualSemHorario();

    const diferenca =
        dataManutencao.getTime() -
        hoje.getTime();

    const dias = Math.ceil(
        diferenca /
        (
            1000 *
            60 *
            60 *
            24
        )
    );

    if (dias < 0) {
        return {
            tipo: "vencida",

            titulo:
                "Manutenção vencida",

            mensagem:
                `A manutenção recomendada venceu há ${Math.abs(dias)} ` +
                `${Math.abs(dias) === 1 ? "dia" : "dias"}.`,

            icone:
                "fa-solid fa-triangle-exclamation"
        };
    }

    if (dias <= 30) {
        return {
            tipo: "atencao",

            titulo:
                dias === 0
                    ? "Manutenção prevista para hoje"
                    : "Próxima manutenção se aproximando",

            mensagem:
                dias === 0
                    ? "Entre em contato com nossa equipe para programar o atendimento."
                    : `Faltam ${dias} ${dias === 1 ? "dia" : "dias"} para a manutenção recomendada.`,

            icone:
                dias === 0
                    ? "fa-solid fa-calendar-day"
                    : "fa-solid fa-clock"
        };
    }

    return {
        tipo: "em-dia",

        titulo:
            "Manutenção em dia",

        mensagem:
            `A próxima manutenção está prevista para ` +
            `${formatarData(proximaManutencao)}.`,

        icone:
            "fa-solid fa-circle-check"
    };
}


function exibirStatus(status) {
    const classes = {
        "em-dia":
            "status-em-dia",

        "atencao":
            "status-atencao",

        "vencida":
            "status-vencida"
    };

    areaStatusOS.innerHTML = `
        <div class="status-box ${classes[status.tipo] || "status-em-dia"}">

            <i class="${escaparHTML(status.icone)}"></i>

            <div>

                <strong>
                    ${escaparHTML(status.titulo)}
                </strong>

                <span>
                    ${escaparHTML(status.mensagem)}
                </span>

            </div>

        </div>
    `;

    areaStatusOS.style.display = "block";
}


/* ==========================================================
   FORMATAÇÃO DOS DADOS
========================================================== */

function formatarCategoria(categoria) {
    const categorias = {
        "eletrica":
            "Serviços elétricos",

        "automacao":
            "Automação",

        "seguranca-eletronica":
            "Segurança eletrônica",

        "rede":
            "Redes e infraestrutura",

        "controle-acesso":
            "Controle de acesso",

        "manutencao":
            "Manutenção",

        "civil":
            "Serviços civis",

        "outro":
            "Ordem de Serviço"
    };

    const chave = String(
        categoria || ""
    ).toLowerCase();

    return categorias[chave] ||
        "Ordem de Serviço";
}


function formatarStatus(status) {
    const nomes = {
        "rascunho":
            "Rascunho",

        "pendente":
            "Pendente",

        "andamento":
            "Em andamento",

        "concluida":
            "Concluída",

        "cancelada":
            "Cancelada"
    };

    const chave = String(
        status || ""
    ).toLowerCase();

    return nomes[chave] ||
        "Não informado";
}


function formatarPrioridade(prioridade) {
    const nomes = {
        "baixa":
            "Baixa",

        "normal":
            "Normal",

        "alta":
            "Alta",

        "urgente":
            "Urgente"
    };

    const chave = String(
        prioridade || ""
    ).toLowerCase();

    return nomes[chave] ||
        "Não informada";
}


/* ==========================================================
   GARANTIA
========================================================== */

function criarTextoGarantia(dataGarantia) {
    const data = converterDataISO(
        dataGarantia
    );

    if (!data) {
        return "Não informada";
    }

    const hoje = obterDataAtualSemHorario();

    if (
        data.getTime() <
        hoje.getTime()
    ) {
        return `Encerrada em ${formatarData(dataGarantia)}`;
    }

    return `Válida até ${formatarData(dataGarantia)}`;
}


function abrirConsultaGarantia(evento) {
    evento.preventDefault();

    campoNumeroOS.focus();

    document
        .querySelector(".consulta")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
}


/* ==========================================================
   DATAS
========================================================== */

function converterDataISO(dataISO) {
    if (!dataISO) {
        return null;
    }

    const partes = String(dataISO)
        .slice(0, 10)
        .split("-");

    if (partes.length !== 3) {
        return null;
    }

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    const data = new Date(
        ano,
        mes - 1,
        dia
    );

    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
    ) {
        return null;
    }

    return data;
}


function formatarData(dataISO) {
    const data = converterDataISO(
        dataISO
    );

    if (!data) {
        return "Não informada";
    }

    return new Intl.DateTimeFormat(
        "pt-BR"
    ).format(data);
}


function obterDataAtualSemHorario() {
    const agora = new Date();

    return new Date(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate()
    );
}


/* ==========================================================
   MENSAGENS
========================================================== */

function limparResultado() {
    areaResultado.style.display = "none";
    areaStatusOS.style.display = "none";

    areaDadosOS.innerHTML = "";
    areaStatusOS.innerHTML = "";
}


function mostrarErro(mensagem) {
    areaStatusOS.style.display = "none";
    areaStatusOS.innerHTML = "";

    areaDadosOS.innerHTML = `
        <div class="mensagem-erro">

            <strong>

                <i class="fa-solid fa-circle-exclamation"></i>

                Não foi possível concluir a consulta

            </strong>

            <p>
                ${escaparHTML(mensagem)}
            </p>

        </div>
    `;

    areaResultado.style.display = "block";

    areaResultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ==========================================================
   CONSULTA PELA URL
   Exemplo:
   /atendimentos/?os=CODIGO-DE-CONSULTA
========================================================== */

async function consultarOSPelaURL() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const codigo = parametros.get("os");

    if (!codigo) {
        return;
    }

    campoNumeroOS.value = normalizarCodigo(
        codigo
    );

    await consultarOrdemDeServico();
}


function atualizarEnderecoURL(codigo) {
    const endereco = new URL(
        window.location.href
    );

    if (codigo) {
        endereco.searchParams.set(
            "os",
            codigo
        );
    } else {
        endereco.searchParams.delete(
            "os"
        );
    }

    window.history.replaceState(
        {},
        "",
        endereco.toString()
    );
}


/* ==========================================================
   SEGURANÇA DOS DADOS EXIBIDOS
========================================================== */

function formatarTextoComQuebras(valor) {
    return escaparHTML(valor)
        .replace(
            /\r?\n/g,
            "<br>"
        );
}


function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}
