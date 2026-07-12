/* ==========================================================
   GRUPO UBARANAS
   LOGIN DO PAINEL ADMINISTRATIVO
   Arquivo: admin/login.js
========================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    const formLogin = document.getElementById("formLogin");
    const campoEmail = document.getElementById("email");
    const campoSenha = document.getElementById("senha");
    const btnEntrar = document.getElementById("btnEntrar");
    const btnMostrarSenha = document.getElementById("btnMostrarSenha");
    const mensagemLogin = document.getElementById("mensagemLogin");

    /*
     * Confere se o cliente Supabase foi carregado.
     */
    if (!window.supabaseClient) {
        mostrarMensagem(
            "Não foi possível conectar ao sistema. Atualize a página e tente novamente.",
            "erro"
        );

        console.error(
            "supabaseClient não foi encontrado. Confira o carregamento do supabase-config.js."
        );

        return;
    }

    /*
     * Se já existir uma sessão válida, entra diretamente no painel.
     */
    await verificarSessaoExistente();

    /*
     * Mostrar ou ocultar a senha.
     */
    if (btnMostrarSenha && campoSenha) {
        btnMostrarSenha.addEventListener("click", () => {
            const senhaEstaVisivel = campoSenha.type === "text";

            campoSenha.type = senhaEstaVisivel
                ? "password"
                : "text";

            btnMostrarSenha.setAttribute(
                "aria-label",
                senhaEstaVisivel
                    ? "Mostrar senha"
                    : "Ocultar senha"
            );

            btnMostrarSenha.setAttribute(
                "title",
                senhaEstaVisivel
                    ? "Mostrar senha"
                    : "Ocultar senha"
            );

            const icone = btnMostrarSenha.querySelector("i");

            if (icone) {
                icone.classList.toggle(
                    "fa-eye",
                    senhaEstaVisivel
                );

                icone.classList.toggle(
                    "fa-eye-slash",
                    !senhaEstaVisivel
                );
            }

            campoSenha.focus();
        });
    }

    /*
     * Envio do formulário de login.
     */
    if (formLogin) {
        formLogin.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            limparMensagem();

            const email = campoEmail.value
                .trim()
                .toLowerCase();

            const senha = campoSenha.value;

            if (!email) {
                mostrarMensagem(
                    "Digite seu e-mail.",
                    "erro"
                );

                campoEmail.focus();

                return;
            }

            if (!emailValido(email)) {
                mostrarMensagem(
                    "Digite um endereço de e-mail válido.",
                    "erro"
                );

                campoEmail.focus();

                return;
            }

            if (!senha) {
                mostrarMensagem(
                    "Digite sua senha.",
                    "erro"
                );

                campoSenha.focus();

                return;
            }

            alterarEstadoBotao(true);

            try {
                const {
                    data,
                    error
                } = await window.supabaseClient.auth.signInWithPassword({
                    email,
                    password: senha
                });

                if (error) {
                    throw error;
                }

                if (!data.session) {
                    throw new Error(
                        "A sessão não foi iniciada."
                    );
                }

                mostrarMensagem(
                    "Login realizado com sucesso. Redirecionando...",
                    "sucesso"
                );

                window.setTimeout(() => {
                    window.location.replace("/admin/");
                }, 600);
            } catch (erro) {
                console.error(
                    "Erro durante o login:",
                    erro
                );

                mostrarMensagem(
                    traduzirErroLogin(erro),
                    "erro"
                );

                campoSenha.value = "";
                campoSenha.focus();
            } finally {
                alterarEstadoBotao(false);
            }
        });
    }

    /*
     * Verifica uma sessão que já esteja salva no navegador.
     */
    async function verificarSessaoExistente() {
        try {
            const {
                data,
                error
            } = await window.supabaseClient.auth.getSession();

            if (error) {
                throw error;
            }

            if (data.session) {
                mostrarMensagem(
                    "Sessão encontrada. Abrindo o painel...",
                    "sucesso"
                );

                window.setTimeout(() => {
                    window.location.replace("/admin/");
                }, 400);
            }
        } catch (erro) {
            console.error(
                "Erro ao verificar sessão:",
                erro
            );
        }
    }

    /*
     * Altera o botão durante o processamento.
     */
    function alterarEstadoBotao(carregando) {
        if (!btnEntrar) {
            return;
        }

        btnEntrar.disabled = carregando;

        if (carregando) {
            btnEntrar.dataset.textoOriginal =
                btnEntrar.innerHTML;

            btnEntrar.innerHTML = `
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                Entrando...
            `;
        } else if (btnEntrar.dataset.textoOriginal) {
            btnEntrar.innerHTML =
                btnEntrar.dataset.textoOriginal;
        }
    }

    /*
     * Exibe mensagens no formulário.
     */
    function mostrarMensagem(texto, tipo) {
        if (!mensagemLogin) {
            return;
        }

        mensagemLogin.textContent = texto;

        mensagemLogin.classList.remove(
            "erro",
            "sucesso",
            "visivel"
        );

        mensagemLogin.classList.add(
            tipo,
            "visivel"
        );

        mensagemLogin.setAttribute(
            "role",
            tipo === "erro"
                ? "alert"
                : "status"
        );

        mensagemLogin.hidden = false;
    }

    /*
     * Limpa a mensagem anterior.
     */
    function limparMensagem() {
        if (!mensagemLogin) {
            return;
        }

        mensagemLogin.textContent = "";

        mensagemLogin.classList.remove(
            "erro",
            "sucesso",
            "visivel"
        );

        mensagemLogin.hidden = true;
    }

    /*
     * Validação simples do formato do e-mail.
     */
    function emailValido(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /*
     * Converte os erros mais comuns do Supabase.
     */
    function traduzirErroLogin(erro) {
        const mensagem = String(
            erro?.message || ""
        ).toLowerCase();

        if (
            mensagem.includes("invalid login credentials") ||
            mensagem.includes("invalid credentials")
        ) {
            return "E-mail ou senha incorretos.";
        }

        if (mensagem.includes("email not confirmed")) {
            return "Este e-mail ainda não foi confirmado.";
        }

        if (
            mensagem.includes("too many requests") ||
            mensagem.includes("rate limit")
        ) {
            return "Muitas tentativas de acesso. Aguarde alguns minutos.";
        }

        if (
            mensagem.includes("failed to fetch") ||
            mensagem.includes("network")
        ) {
            return "Não foi possível conectar ao servidor. Verifique sua internet.";
        }

        return "Não foi possível realizar o login. Confira os dados e tente novamente.";
    }
});
