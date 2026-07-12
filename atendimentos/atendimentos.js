/* ==========================================================
   GRUPO UBARANAS
   PORTAL DO CLIENTE — JAVASCRIPT V1.0
   Arquivo: atendimentos/atendimentos.js
========================================================== */

"use strict";

/* ==========================================================
   ELEMENTOS DA PÁGINA
========================================================== */

const campoNumeroOS = document.getElementById("numeroOS");
const botaoConsultar = document.getElementById("btnConsultar");
const areaResultado = document.getElementById("resultado");
const areaDadosOS = document.getElementById("dadosOS");
const areaStatusOS = document.getElementById("statusOS");
const cardGarantia = document.getElementById("cardGarantia");

/* Armazena as ordens carregadas do os.json */
let ordensDeServico = [];

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

async function inicializarPortal() {
    campoNumeroOS.addEventListener("input", formatarCampoOS);
    campoNumeroOS.addEventListener("keydown", consultarComEnter);
    botaoConsultar.addEventListener("click", consultarOrdemDeServico);

    if (cardGarantia) {
        cardGarantia.addEventListener("click", abrirConsultaGarantia);
    }

    botaoConsultar.disabled = true;
    botaoConsultar.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Carregando
    `;

    await carregarOrdensDeServico();

    botaoConsultar.disabled = false;
    botaoConsultar.innerHTML = `
        <i class="fa-solid fa-magnifying-glass"></i>
        Consultar
    `;

    consultarOSPelaURL();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarPortal);
} else {
    inicializarPortal();
}

/* ==========================================================
   CARREGAMENTO DO ARQUIVO JSON
========================================================== */

async function carregarOrdensDeServico() {
    try {
        const resposta = await fetch("os.json", {
            cache: "no-store"
        });

        if (!resposta.ok) {
            throw new Error(
                `Não foi possível carregar o arquivo os.json. Código: ${resposta.status}`
            );
        }

        const dados = await resposta.json();

        if (!dados || !Array.isArray(dados.ordens)) {
            throw new Error(
                "O arquivo os.json não possui uma estrutura válida."
            );
        }

        ordensDeServico = dados.ordens;
    } catch (erro) {
        console.error("Erro ao carregar as Ordens de Serviço:", erro);

        mostrarErro(
            "Não foi possível acessar o sistema de consulta neste momento. " +
            "Tente novamente mais tarde ou entre em contato pelo WhatsApp."
        );
    }
}

/* ==========================================================
   FORMATAÇÃO DO CAMPO
========================================================== */

function formatarCampoOS(evento) {
    const valorFormatado = evento.target.value
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9-]/g, "");

    evento.target.value = valorFormatado;
}

function normalizarNumeroOS(numeroOS) {
    return String(numeroOS || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");
}

/* ==========================================================
   CONSULTA PELO BOTÃO OU TECLA ENTER
========================================================== */

function consultarComEnter(evento) {
    if (evento.key === "Enter") {
        evento.preventDefault();
        consultarOrdemDeServico();
    }
}

function consultarOrdemDeServico() {
    const numeroInformado = normalizarNumeroOS(campoNumeroOS.value);

    limparResultado();

    if (!numeroInformado) {
        mostrarErro(
            "Digite o número da Ordem de Serviço para realizar a consulta."
        );

        campoNumeroOS.focus();
        return;
    }

    if (ordensDeServico.length === 0) {
        mostrarErro(
            "As informações das Ordens de Serviço ainda não foram carregadas. " +
            "Atualize a página e tente novamente."
        );

        return;
    }

    const ordemEncontrada = ordensDeServico.find((ordem) => {
        return normalizarNumeroOS(ordem.os) === numeroInformado;
    });

    if (!ordemEncontrada) {
        mostrarErro(
            `Não encontramos a Ordem de Serviço ${numeroInformado}. ` +
            "Confira o número informado na etiqueta e tente novamente."
        );

        atualizarEnderecoURL("");
        return;
    }

    exibirOrdemDeServico(ordemEncontrada);
    atualizarEnderecoURL(ordemEncontrada.os);
}

/* ==========================================================
   EXIBIÇÃO DA ORDEM DE SERVIÇO
========================================================== */

function exibirOrdemDeServico(ordem) {
    const status = calcularStatusManutencao(
        ordem?.datas?.proxima_manutencao,
        ordem?.status
    );

    exibirStatus(status);

    const servicosExecutados = criarListaServicos(
        ordem.servicos_executados
    );

    const documentos = criarAreaDocumentos(ordem.documentos);

    areaDadosOS.innerHTML = `
        <div class="os-cabecalho">
            <div>
                <h3>${escaparHTML(
                    ordem?.servico?.tipo || "Ordem de Serviço"
                )}</h3>

                <p>
                    ${escaparHTML(
                        ordem?.servico?.descricao ||
                        "Informações do serviço realizado."
                    )}
                </p>
            </div>

            <span class="os-numero">
                <i class="fa-solid fa-file-circle-check"></i>
                ${escaparHTML(ordem.os)}
            </span>
        </div>

        <div class="os-grade">

            ${criarItemOS(
                "Cliente",
                ordem?.cliente?.nome || "Não informado"
            )}

            ${criarItemOS(
                "Local",
                ordem?.equipamento?.local || "Não informado"
            )}

            ${criarItemOS(
                "Equipamento",
                ordem?.equipamento?.nome || "Não informado"
            )}

            ${criarItemOS(
                "Modelo ou identificação",
                montarIdentificacaoEquipamento(ordem.equipamento)
            )}

            ${criarItemOS(
                "Data da execução",
                formatarData(ordem?.datas?.execucao)
            )}

            ${criarItemOS(
                "Próxima manutenção",
                formatarData(ordem?.datas?.proxima_manutencao)
            )}

            ${criarItemOS(
                "Garantia",
                criarTextoGarantia(ordem?.datas?.garantia)
            )}

            ${criarItemOS(
                "Técnico responsável",
                ordem?.tecnico?.nome || "Não informado"
            )}

        </div>

        <div class="os-bloco">
            <h3>
                <i class="fa-solid fa-screwdriver-wrench"></i>
                Serviços executados
            </h3>

            ${servicosExecutados}
        </div>

        <div class="os-bloco">
            <h3>
                <i class="fa-solid fa-clipboard-list"></i>
                Observações técnicas
            </h3>

            <p>
                ${escaparHTML(
                    ordem.observacoes || "Nenhuma observação registrada."
                )}
            </p>
        </div>

        ${documentos}
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
            <span>${escaparHTML(titulo)}</span>
            <strong>${escaparHTML(valor)}</strong>
        </div>
    `;
}

function montarIdentificacaoEquipamento(equipamento) {
    if (!equipamento) {
        return "Não informado";
    }

    const partes = [];

    if (equipamento.modelo) {
        partes.push(equipamento.modelo);
    }

    if (equipamento.patrimonio) {
        partes.push(`Patrimônio: ${equipamento.patrimonio}`);
    }

    return partes.length > 0
        ? partes.join(" • ")
        : "Não informado";
}

function criarListaServicos(servicos) {
    if (!Array.isArray(servicos) || servicos.length === 0) {
        return "<p>Nenhum serviço detalhado foi registrado.</p>";
    }

    const itens = servicos
        .map((servico) => `<li>${escaparHTML(servico)}</li>`)
        .join("");

    return `<ul>${itens}</ul>`;
}

function criarAreaDocumentos(documentos) {
    if (!documentos) {
        return "";
    }

    const possuiPDF = Boolean(documentos.pdf);
    const possuiFotos =
        Array.isArray(documentos.fotos) &&
        documentos.fotos.length > 0;

    if (!possuiPDF && !possuiFotos) {
        return "";
    }

    let conteudo = "";

    if (possuiPDF) {
        conteudo += `
            <p>
                <a
                    href="${escaparAtributo(documentos.pdf)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i class="fa-solid fa-file-pdf"></i>
                    Abrir relatório em PDF
                </a>
            </p>
        `;
    }

    if (possuiFotos) {
        conteudo += `
            <p>
                <i class="fa-solid fa-images"></i>
                ${documentos.fotos.length}
                ${documentos.fotos.length === 1 ? "foto disponível" : "fotos disponíveis"}
            </p>
        `;
    }

    return `
        <div class="os-bloco">
            <h3>
                <i class="fa-solid fa-folder-open"></i>
                Documentos do serviço
            </h3>

            ${conteudo}
        </div>
    `;
}

/* ==========================================================
   STATUS DA MANUTENÇÃO
========================================================== */

function calcularStatusManutencao(dataProximaManutencao, statusSalvo) {
    const dataManutencao = converterDataISO(dataProximaManutencao);

    if (!dataManutencao) {
        return statusPeloCadastro(statusSalvo);
    }

    const hoje = obterDataAtualSemHorario();
    const diferenca = dataManutencao.getTime() - hoje.getTime();
    const diasRestantes = Math.ceil(
        diferenca / (1000 * 60 * 60 * 24)
    );

    if (diasRestantes < 0) {
        return {
            tipo: "vencida",
            titulo: "Manutenção vencida",
            mensagem:
                `A manutenção recomendada venceu há ${Math.abs(diasRestantes)} ` +
                `${Math.abs(diasRestantes) === 1 ? "dia" : "dias"}.`,
            icone: "fa-solid fa-triangle-exclamation"
        };
    }

    if (diasRestantes === 0) {
        return {
            tipo: "atencao",
            titulo: "Manutenção prevista para hoje",
            mensagem:
                "Entre em contato com nossa equipe para programar o atendimento.",
            icone: "fa-solid fa-calendar-day"
        };
    }

    if (diasRestantes <= 30) {
        return {
            tipo: "atencao",
            titulo: "Próxima manutenção se aproximando",
            mensagem:
                `Faltam ${diasRestantes} ` +
                `${diasRestantes === 1 ? "dia" : "dias"} para a manutenção recomendada.`,
            icone: "fa-solid fa-clock"
        };
    }

    return {
        tipo: "em-dia",
        titulo: "Manutenção em dia",
        mensagem:
            `A próxima manutenção está prevista para ` +
            `${formatarData(dataProximaManutencao)}.`,
        icone: "fa-solid fa-circle-check"
    };
}

function statusPeloCadastro(statusSalvo) {
    const status = String(statusSalvo || "").toLowerCase();

    if (status === "vencida") {
        return {
            tipo: "vencida",
            titulo: "Manutenção vencida",
            mensagem:
                "Entre em contato para programar uma nova manutenção.",
            icone: "fa-solid fa-triangle-exclamation"
        };
    }

    if (status === "atencao") {
        return {
            tipo: "atencao",
            titulo: "Atenção à manutenção",
            mensagem:
                "Verifique a data recomendada e entre em contato com nossa equipe.",
            icone: "fa-solid fa-clock"
        };
    }

    return {
        tipo: "em-dia",
        titulo: "Manutenção em dia",
        mensagem:
            "O equipamento possui registro de manutenção ativo.",
        icone: "fa-solid fa-circle-check"
    };
}

function exibirStatus(status) {
    const classeStatus = {
        "em-dia": "status-em-dia",
        "atencao": "status-atencao",
        "vencida": "status-vencida"
    };

    areaStatusOS.innerHTML = `
        <div class="status-box ${classeStatus[status.tipo]}">
            <i class="${status.icone}"></i>

            <div>
                <strong>${escaparHTML(status.titulo)}</strong>
                <span>${escaparHTML(status.mensagem)}</span>
            </div>
        </div>
    `;

    areaStatusOS.style.display = "block";
}

/* ==========================================================
   GARANTIA
========================================================== */

function criarTextoGarantia(dataGarantia) {
    const data = converterDataISO(dataGarantia);

    if (!data) {
        return "Não informada";
    }

    const hoje = obterDataAtualSemHorario();

    if (data.getTime() < hoje.getTime()) {
        return `Encerrada em ${formatarData(dataGarantia)}`;
    }

    return `Válida até ${formatarData(dataGarantia)}`;
}

function abrirConsultaGarantia(evento) {
    evento.preventDefault();

    campoNumeroOS.focus();

    document.querySelector(".consulta").scrollIntoView({
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

    const partes = String(dataISO).split("-");

    if (partes.length !== 3) {
        return null;
    }

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (!ano || !mes || !dia) {
        return null;
    }

    const data = new Date(ano, mes - 1, dia);

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
    const data = converterDataISO(dataISO);

    if (!data) {
        return "Não informada";
    }

    return new Intl.DateTimeFormat("pt-BR").format(data);
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
   MENSAGENS E LIMPEZA
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

            <p>${escaparHTML(mensagem)}</p>
        </div>
    `;

    areaResultado.style.display = "block";

    areaResultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* ==========================================================
   CONSULTA DIRETA PELA URL
   Exemplo:
   /atendimentos/?os=UB-260001
========================================================== */

function consultarOSPelaURL() {
    const parametros = new URLSearchParams(window.location.search);
    const numeroOS = parametros.get("os");

    if (!numeroOS) {
        return;
    }

    campoNumeroOS.value = normalizarNumeroOS(numeroOS);
    consultarOrdemDeServico();
}

function atualizarEnderecoURL(numeroOS) {
    const endereco = new URL(window.location.href);

    if (numeroOS) {
        endereco.searchParams.set("os", numeroOS);
    } else {
        endereco.searchParams.delete("os");
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

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escaparAtributo(valor) {
    return escaparHTML(valor);
}
