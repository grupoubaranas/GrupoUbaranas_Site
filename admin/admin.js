/* ==========================================================
   GRUPO UBARANAS
   PAINEL ADMINISTRATIVO — JAVASCRIPT V2.0
   Arquivo: admin/admin.js

   Versão integrada ao Supabase.
   As Ordens de Serviço são gravadas no banco de dados.
========================================================== */

"use strict";

(() => {
    const PAGE_SIZE = 8;

    const statusLabels = {
        rascunho: "Rascunho",
        pendente: "Pendente",
        andamento: "Em andamento",
        concluida: "Concluída",
        cancelada: "Cancelada"
    };

    const statusClasses = {
        rascunho: "status-rascunho",
        pendente: "status-pendente",
        andamento: "status-andamento",
        concluida: "status-concluida",
        cancelada: "status-cancelada"
    };

    const priorityLabels = {
        baixa: "Baixa",
        normal: "Normal",
        alta: "Alta",
        urgente: "Urgente"
    };

    const priorityClasses = {
        baixa: "badge-info",
        normal: "badge-neutral",
        alta: "badge-warning",
        urgente: "badge-danger"
    };

    const clientTypeLabels = {
        residencial: "Residencial",
        comercial: "Comercial",
        condominio: "Condomínio",
        industrial: "Industrial",
        outro: "Outro"
    };

    const categoryLabels = {
        eletrica: "Elétrica",
        automacao: "Automação",
        "seguranca-eletronica": "Segurança eletrônica",
        rede: "Infraestrutura de rede",
        "controle-acesso": "Controle de acesso",
        manutencao: "Manutenção de equipamentos",
        civil: "Manutenção civil",
        outro: "Outro"
    };

    const activityIcons = {
        create: "fa-plus",
        edit: "fa-pen",
        complete: "fa-circle-check",
        delete: "fa-trash",
        refresh: "fa-rotate"
    };

    const state = {
        orders: [],
        activities: [],
        filteredOrders: [],
        currentPage: 1,
        selectedDeleteId: null,
        modalMode: "create",
        user: null,
        loading: false
    };

    const dom = {};

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

    async function init() {
        cacheDom();
        bindEvents();
        updateCurrentDate();

        if (!window.supabaseClient) {
            console.error(
                "supabaseClient não foi encontrado."
            );

            showToast(
                "Erro de conexão",
                "Não foi possível iniciar a conexão com o banco de dados.",
                "error"
            );

            window.setTimeout(() => {
                window.location.replace(
                    "/admin/login.html"
                );
            }, 1200);

            return;
        }

        setPageLoading(true);

        const user =
            await requireAuthenticatedUser();

        if (!user) {
            return;
        }

        state.user = user;

        updateUserInfo(user);
        registerAuthWatcher();

        await loadOrdersFromDatabase();

        setPageLoading(false);
    }

    function cacheDom() {
        const ids = [
            "sidebar",
            "sidebarOverlay",
            "menuToggle",
            "currentDate",
            "notificationButton",
            "refreshDashboard",
            "newOrderButton",
            "totalOrders",
            "ordersInProgress",
            "pendingOrders",
            "completedOrders",
            "exportOrders",
            "searchOrder",
            "statusFilter",
            "priorityFilter",
            "clearFilters",
            "ordersTableBody",
            "paginationInfo",
            "previousPage",
            "nextPage",
            "activityList",
            "quickNewOrder",
            "quickNewClient",
            "quickMaintenance",
            "quickReport",
            "orderModal",
            "orderModalTitle",
            "closeOrderModal",
            "orderForm",
            "orderId",
            "orderNumber",
            "orderNumberError",
            "openingDate",
            "clientName",
            "clientType",
            "clientPhone",
            "clientEmail",
            "serviceAddress",
            "serviceCategory",
            "serviceTitle",
            "orderStatus",
            "orderPriority",
            "technicianName",
            "equipmentName",
            "equipmentModel",
            "serialNumber",
            "reportedProblem",
            "technicalDiagnosis",
            "performedService",
            "materialsUsed",
            "orderNotes",
            "completionDate",
            "nextMaintenance",
            "warrantyDate",
            "visibleInPortal",
            "cancelOrderModal",
            "saveOrderButton",
            "deleteModal",
            "closeDeleteModal",
            "deleteOrderNumber",
            "cancelDelete",
            "confirmDelete",
            "toastContainer",
            "btnLogout",
            "userAvatar",
            "userName",
            "userRole",
            "demoAlert"
        ];

        ids.forEach((id) => {
            dom[id] =
                document.getElementById(id);
        });

        dom.currentPageButton =
            document.querySelector(
                ".pagination .page-button.active"
            );

        dom.menuItems = Array.from(
            document.querySelectorAll(
                ".menu-item"
            )
        );

        dom.formFields = dom.orderForm
            ? Array.from(
                dom.orderForm.querySelectorAll(
                    "input, select, textarea"
                )
            )
            : [];
    }

    function bindEvents() {
        dom.menuToggle?.addEventListener(
            "click",
            toggleSidebar
        );

        dom.sidebarOverlay?.addEventListener(
            "click",
            closeSidebar
        );

        dom.menuItems.forEach((item) => {
            item.addEventListener(
                "click",
                handleMenuClick
            );
        });

        dom.newOrderButton?.addEventListener(
            "click",
            () => openOrderModal("create")
        );

        dom.quickNewOrder?.addEventListener(
            "click",
            () => openOrderModal("create")
        );

        dom.quickNewClient?.addEventListener(
            "click",
            () => {
                openOrderModal("create");

                window.setTimeout(
                    () => dom.clientName?.focus(),
                    80
                );
            }
        );

        dom.quickMaintenance?.addEventListener(
            "click",
            () => {
                openOrderModal("create");

                window.setTimeout(
                    () =>
                        dom.nextMaintenance?.focus(),
                    80
                );

                showToast(
                    "Programação de manutenção",
                    "Preencha os dados da OS e informe a data da próxima manutenção.",
                    "warning"
                );
            }
        );

        dom.quickReport?.addEventListener(
            "click",
            exportOrdersToCsv
        );

        dom.exportOrders?.addEventListener(
            "click",
            exportOrdersToCsv
        );

        dom.searchOrder?.addEventListener(
            "input",
            () => {
                state.currentPage = 1;
                applyFilters();
            }
        );

        dom.statusFilter?.addEventListener(
            "change",
            () => {
                state.currentPage = 1;
                applyFilters();
            }
        );

        dom.priorityFilter?.addEventListener(
            "change",
            () => {
                state.currentPage = 1;
                applyFilters();
            }
        );

        dom.clearFilters?.addEventListener(
            "click",
            clearFilters
        );

        dom.previousPage?.addEventListener(
            "click",
            previousPage
        );

        dom.nextPage?.addEventListener(
            "click",
            nextPage
        );

        dom.ordersTableBody?.addEventListener(
            "click",
            handleTableAction
        );

        dom.closeOrderModal?.addEventListener(
            "click",
            closeOrderModal
        );

        dom.cancelOrderModal?.addEventListener(
            "click",
            closeOrderModal
        );

        dom.orderForm?.addEventListener(
            "submit",
            saveOrder
        );

        dom.closeDeleteModal?.addEventListener(
            "click",
            closeDeleteModal
        );

        dom.cancelDelete?.addEventListener(
            "click",
            closeDeleteModal
        );

        dom.confirmDelete?.addEventListener(
            "click",
            confirmDeleteOrder
        );

        dom.orderModal?.addEventListener(
            "click",
            (event) => {
                if (
                    event.target ===
                    dom.orderModal
                ) {
                    closeOrderModal();
                }
            }
        );

        dom.deleteModal?.addEventListener(
            "click",
            (event) => {
                if (
                    event.target ===
                    dom.deleteModal
                ) {
                    closeDeleteModal();
                }
            }
        );

        document.addEventListener(
            "keydown",
            handleEscapeKey
        );

        dom.refreshDashboard?.addEventListener(
            "click",
            refreshDashboard
        );

        dom.notificationButton?.addEventListener(
            "click",
            () => {
                showToast(
                    "Notificações",
                    "Não há novas notificações pendentes neste momento.",
                    "success"
                );
            }
        );

        dom.orderNumber?.addEventListener(
            "input",
            () => {
                dom.orderNumber.value =
                    dom.orderNumber.value
                        .toUpperCase();

                clearOrderNumberError();
            }
        );

        dom.clientPhone?.addEventListener(
            "input",
            applyPhoneMask
        );

        dom.orderStatus?.addEventListener(
            "change",
            () => {
                if (
                    dom.orderStatus.value ===
                        "concluida" &&
                    !dom.completionDate.value
                ) {
                    dom.completionDate.value =
                        todayIso();
                }
            }
        );

        dom.btnLogout?.addEventListener(
            "click",
            logout
        );
    }

    async function requireAuthenticatedUser() {
        try {
            const {
                data,
                error
            } =
                await window.supabaseClient
                    .auth
                    .getUser();

            if (error) {
                throw error;
            }

            if (!data.user) {
                window.location.replace(
                    "/admin/login.html"
                );

                return null;
            }

            return data.user;
        } catch (error) {
            console.error(
                "Erro ao validar o usuário:",
                error
            );

            window.location.replace(
                "/admin/login.html"
            );

            return null;
        }
    }

    function registerAuthWatcher() {
        window.supabaseClient
            .auth
            .onAuthStateChange((event) => {
                if (event === "SIGNED_OUT") {
                    window.location.replace(
                        "/admin/login.html"
                    );
                }
            });
    }

    async function logout(event) {
        event?.preventDefault();

        if (!window.supabaseClient) {
            window.location.replace(
                "/admin/login.html"
            );

            return;
        }

        try {
            setLogoutLoading(true);

            const {
                error
            } =
                await window.supabaseClient
                    .auth
                    .signOut();

            if (error) {
                throw error;
            }

            window.location.replace(
                "/admin/login.html"
            );
        } catch (error) {
            console.error(
                "Erro ao sair do painel:",
                error
            );

            setLogoutLoading(false);

            showToast(
                "Não foi possível sair",
                "Atualize a página e tente novamente.",
                "error"
            );
        }
    }

    function setLogoutLoading(loading) {
        if (!dom.btnLogout) {
            return;
        }

        dom.btnLogout.style.pointerEvents =
            loading
                ? "none"
                : "";

        dom.btnLogout.style.opacity =
            loading
                ? "0.65"
                : "";
    }

    function updateUserInfo(user) {
        const metadataName = String(
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            ""
        ).trim();

        const email = String(
            user?.email || ""
        ).trim();

        const emailName = email
            ? email.split("@")[0]
            : "Administrador";

        const displayName =
            metadataName || emailName;

        if (dom.userName) {
            dom.userName.textContent =
                displayName;
        }

        if (dom.userRole) {
            dom.userRole.textContent =
                "Administrador";
        }

        if (dom.userAvatar) {
            dom.userAvatar.textContent =
                createInitials(displayName);
        }
    }

    function createInitials(name) {
        const parts = String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (parts.length === 0) {
            return "AD";
        }

        if (parts.length === 1) {
            return parts[0]
                .slice(0, 2)
                .toUpperCase();
        }

        return `${parts[0][0]}${parts.at(-1)[0]}`
            .toUpperCase();
    }
       async function loadOrdersFromDatabase({
        notify = false
    } = {}) {
        try {
            setPageLoading(true);

            const {
                data,
                error
            } = await window.supabaseClient
                .from("ordens_servico")
                .select("*")
                .order(
                    "atualizado_em",
                    {
                        ascending: false
                    }
                );

            if (error) {
                throw error;
            }

            state.orders = Array.isArray(data)
                ? data.map(mapDatabaseOrder)
                : [];

            state.activities = buildActivities(
                state.orders
            );

            state.currentPage = 1;

            applyFilters();
            renderActivities();
            updateDatabaseNotice();

            if (notify) {
                showToast(
                    "Painel atualizado",
                    "Os dados foram recarregados do banco de dados.",
                    "success"
                );
            }
        } catch (error) {
            console.error(
                "Erro ao carregar as Ordens de Serviço:",
                error
            );

            state.orders = [];
            state.activities = [];

            applyFilters();
            renderActivities();

            showToast(
                "Erro ao carregar",
                translateDatabaseError(error),
                "error"
            );
        } finally {
            setPageLoading(false);
        }
    }


    function mapDatabaseOrder(row) {
        return {
            id: row.id,

            numero:
                row.numero || "",

            codigoConsulta:
                row.codigo_consulta || "",

            dataAbertura:
                row.data_abertura || "",

            cliente:
                row.cliente || "",

            tipoCliente:
                row.tipo_cliente ||
                "residencial",

            telefone:
                row.telefone || "",

            email:
                row.email || "",

            endereco:
                row.endereco || "",

            categoria:
                row.categoria ||
                "outro",

            servico:
                row.servico || "",

            status:
                row.status ||
                "rascunho",

            prioridade:
                row.prioridade ||
                "normal",

            tecnico:
                row.tecnico || "",

            equipamento:
                row.equipamento || "",

            marcaModelo:
                row.marca_modelo || "",

            numeroSerie:
                row.numero_serie || "",

            problemaRelatado:
                row.problema_relatado || "",

            diagnostico:
                row.diagnostico || "",

            servicoExecutado:
                row.servico_executado || "",

            materiais:
                row.materiais || "",

            observacoes:
                row.observacoes || "",

            dataConclusao:
                row.data_conclusao || "",

            proximaManutencao:
                row.proxima_manutencao || "",

            garantiaAte:
                row.garantia_ate || "",

            visivelNoPortal:
                Boolean(
                    row.visivel_no_portal
                ),

            criadoEm:
                row.criado_em || "",

            atualizadoEm:
                row.atualizado_em || ""
        };
    }


    function mapFormToDatabase(formData) {
        return {
            numero: getFormValue(
                formData,
                "numero"
            ).toUpperCase(),

            data_abertura:
                getFormValue(
                    formData,
                    "dataAbertura"
                ) || todayIso(),

            cliente: getFormValue(
                formData,
                "cliente"
            ),

            tipo_cliente: getFormValue(
                formData,
                "tipoCliente",
                "residencial"
            ),

            telefone: nullIfEmpty(
                getFormValue(
                    formData,
                    "telefone"
                )
            ),

            email: nullIfEmpty(
                getFormValue(
                    formData,
                    "email"
                )
            ),

            endereco: nullIfEmpty(
                getFormValue(
                    formData,
                    "endereco"
                )
            ),

            categoria: getFormValue(
                formData,
                "categoria",
                "outro"
            ),

            servico: getFormValue(
                formData,
                "servico"
            ),

            status: getFormValue(
                formData,
                "status",
                "rascunho"
            ),

            prioridade: getFormValue(
                formData,
                "prioridade",
                "normal"
            ),

            tecnico: nullIfEmpty(
                getFormValue(
                    formData,
                    "tecnico"
                )
            ),

            equipamento: nullIfEmpty(
                getFormValue(
                    formData,
                    "equipamento"
                )
            ),

            marca_modelo: nullIfEmpty(
                getFormValue(
                    formData,
                    "marcaModelo"
                )
            ),

            numero_serie: nullIfEmpty(
                getFormValue(
                    formData,
                    "numeroSerie"
                )
            ),

            problema_relatado: nullIfEmpty(
                getFormValue(
                    formData,
                    "problemaRelatado"
                )
            ),

            diagnostico: nullIfEmpty(
                getFormValue(
                    formData,
                    "diagnostico"
                )
            ),

            servico_executado: nullIfEmpty(
                getFormValue(
                    formData,
                    "servicoExecutado"
                )
            ),

            materiais: nullIfEmpty(
                getFormValue(
                    formData,
                    "materiais"
                )
            ),

            observacoes: nullIfEmpty(
                getFormValue(
                    formData,
                    "observacoes"
                )
            ),

            data_conclusao: nullIfEmpty(
                getFormValue(
                    formData,
                    "dataConclusao"
                )
            ),

            proxima_manutencao: nullIfEmpty(
                getFormValue(
                    formData,
                    "proximaManutencao"
                )
            ),

            garantia_ate: nullIfEmpty(
                getFormValue(
                    formData,
                    "garantiaAte"
                )
            ),

            visivel_no_portal:
                Boolean(
                    dom.visibleInPortal
                        ?.checked
                )
        };
    }


    function buildActivities(orders) {
        return [...orders]
            .sort(sortOrders)
            .slice(0, 30)
            .map((order) => {
                const createdAt =
                    new Date(
                        order.criadoEm || 0
                    ).getTime();

                const updatedAt =
                    new Date(
                        order.atualizadoEm || 0
                    ).getTime();

                const wasEdited =
                    Number.isFinite(
                        createdAt
                    ) &&
                    Number.isFinite(
                        updatedAt
                    ) &&
                    Math.abs(
                        updatedAt -
                        createdAt
                    ) > 2000;

                if (
                    order.status ===
                    "concluida"
                ) {
                    return {
                        id:
                            `complete-${order.id}`,

                        type:
                            "complete",

                        title:
                            "Serviço concluído",

                        text:
                            `${order.numero} está marcada como concluída.`,

                        date:
                            order.atualizadoEm ||
                            order.criadoEm
                    };
                }

                if (wasEdited) {
                    return {
                        id:
                            `edit-${order.id}`,

                        type:
                            "edit",

                        title:
                            "Ordem de serviço atualizada",

                        text:
                            `${order.numero} recebeu uma atualização.`,

                        date:
                            order.atualizadoEm ||
                            order.criadoEm
                    };
                }

                return {
                    id:
                        `create-${order.id}`,

                    type:
                        "create",

                    title:
                        "Nova ordem de serviço cadastrada",

                    text:
                        `${order.numero} foi adicionada ao sistema.`,

                    date:
                        order.criadoEm ||
                        order.atualizadoEm
                };
            });
    }


    function updateDatabaseNotice() {
        if (!dom.demoAlert) {
            return;
        }

        dom.demoAlert.innerHTML = `
            <i
                class="fa-solid fa-database"
                aria-hidden="true"
            ></i>

            <div>
                <strong>
                    Painel conectado ao banco de dados.
                </strong>

                As Ordens de Serviço cadastradas agora são
                salvas no Supabase e podem ser consultadas
                no Portal do Cliente.
            </div>
        `;
    }


    function setPageLoading(loading) {
        state.loading = loading;

        if (dom.refreshDashboard) {
            dom.refreshDashboard.disabled =
                loading;
        }

        if (dom.newOrderButton) {
            dom.newOrderButton.disabled =
                loading;
        }

        const refreshIcon =
            dom.refreshDashboard
                ?.querySelector("i");

        refreshIcon?.classList.toggle(
            "fa-spin",
            loading
        );
    }
       async function refreshDashboard() {
        if (state.loading) {
            return;
        }

        await loadOrdersFromDatabase({
            notify: true
        });
    }


    function openOrderModal(
        mode = "create",
        orderId = null
    ) {
        if (
            !dom.orderModal ||
            !dom.orderForm
        ) {
            return;
        }

        state.modalMode = mode;

        resetOrderForm();

        const order = orderId
            ? state.orders.find(
                (item) =>
                    String(item.id) ===
                    String(orderId)
            )
            : null;

        if (
            mode !== "create" &&
            !order
        ) {
            showToast(
                "Registro não encontrado",
                "Não foi possível localizar a Ordem de Serviço selecionada.",
                "error"
            );

            return;
        }

        if (mode === "create") {
            dom.orderModalTitle.textContent =
                "Nova Ordem de Serviço";

            dom.orderId.value = "";

            dom.orderNumber.value =
                generateNextOrderNumber();

            dom.openingDate.value =
                todayIso();

            dom.orderStatus.value =
                "rascunho";

            dom.orderPriority.value =
                "normal";

            dom.visibleInPortal.checked =
                true;

            setFormReadOnly(false);

            if (dom.saveOrderButton) {
                dom.saveOrderButton.style.display =
                    "";

                dom.saveOrderButton.innerHTML = `
                    <i class="fa-solid fa-floppy-disk"></i>
                    Salvar Ordem de Serviço
                `;
            }
        }

        if (mode === "edit") {
            dom.orderModalTitle.textContent =
                `Editar ${order.numero}`;

            fillOrderForm(order);

            setFormReadOnly(false);

            if (dom.saveOrderButton) {
                dom.saveOrderButton.style.display =
                    "";

                dom.saveOrderButton.innerHTML = `
                    <i class="fa-solid fa-floppy-disk"></i>
                    Salvar alterações
                `;
            }
        }

        if (mode === "view") {
            dom.orderModalTitle.textContent =
                `Detalhes da ${order.numero}`;

            fillOrderForm(order);

            setFormReadOnly(true);

            if (dom.saveOrderButton) {
                dom.saveOrderButton.style.display =
                    "none";
            }
        }

        dom.orderModal.classList.add(
            "active"
        );

        dom.orderModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        window.setTimeout(() => {
            if (mode === "create") {
                dom.clientName?.focus();
            } else {
                dom.closeOrderModal?.focus();
            }
        }, 80);
    }


    function closeOrderModal() {
        if (!dom.orderModal) {
            return;
        }

        dom.orderModal.classList.remove(
            "active"
        );

        dom.orderModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        state.modalMode = "create";

        resetOrderForm();
    }


    function resetOrderForm() {
        dom.orderForm?.reset();

        clearOrderNumberError();

        if (dom.orderId) {
            dom.orderId.value = "";
        }

        setFormReadOnly(false);

        if (dom.saveOrderButton) {
            dom.saveOrderButton.disabled =
                false;

            dom.saveOrderButton.style.display =
                "";

            dom.saveOrderButton.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Salvar Ordem de Serviço
            `;
        }
    }


    function fillOrderForm(order) {
        dom.orderId.value =
            order.id || "";

        dom.orderNumber.value =
            order.numero || "";

        dom.openingDate.value =
            order.dataAbertura || "";

        dom.clientName.value =
            order.cliente || "";

        dom.clientType.value =
            order.tipoCliente ||
            "residencial";

        dom.clientPhone.value =
            order.telefone || "";

        dom.clientEmail.value =
            order.email || "";

        dom.serviceAddress.value =
            order.endereco || "";

        dom.serviceCategory.value =
            order.categoria ||
            "outro";

        dom.serviceTitle.value =
            order.servico || "";

        dom.orderStatus.value =
            order.status ||
            "rascunho";

        dom.orderPriority.value =
            order.prioridade ||
            "normal";

        dom.technicianName.value =
            order.tecnico || "";

        dom.equipmentName.value =
            order.equipamento || "";

        dom.equipmentModel.value =
            order.marcaModelo || "";

        dom.serialNumber.value =
            order.numeroSerie || "";

        dom.reportedProblem.value =
            order.problemaRelatado || "";

        dom.technicalDiagnosis.value =
            order.diagnostico || "";

        dom.performedService.value =
            order.servicoExecutado || "";

        dom.materialsUsed.value =
            order.materiais || "";

        dom.orderNotes.value =
            order.observacoes || "";

        dom.completionDate.value =
            order.dataConclusao || "";

        dom.nextMaintenance.value =
            order.proximaManutencao || "";

        dom.warrantyDate.value =
            order.garantiaAte || "";

        dom.visibleInPortal.checked =
            Boolean(
                order.visivelNoPortal
            );
    }


    function setFormReadOnly(readOnly) {
        dom.formFields.forEach((field) => {
            if (
                field.id === "orderId"
            ) {
                return;
            }

            if (
                field.type === "checkbox"
            ) {
                field.disabled =
                    readOnly;

                return;
            }

            field.readOnly =
                readOnly;

            if (
                field.tagName === "SELECT"
            ) {
                field.disabled =
                    readOnly;
            }
        });
    }


    async function saveOrder(event) {
        event.preventDefault();

        if (
            state.modalMode === "view"
        ) {
            return;
        }

        clearOrderNumberError();

        const validation =
            validateOrderForm();

        if (!validation.valid) {
            showToast(
                "Revise o formulário",
                validation.message,
                "warning"
            );

            validation.field?.focus();

            return;
        }

        const formData =
            new FormData(
                dom.orderForm
            );

        const payload =
            mapFormToDatabase(
                formData
            );

        const currentId =
            String(
                dom.orderId?.value || ""
            ).trim();

        const duplicatedOrder =
            state.orders.find(
                (order) => {
                    const sameNumber =
                        normalizeText(
                            order.numero
                        ) ===
                        normalizeText(
                            payload.numero
                        );

                    const differentId =
                        String(order.id) !==
                        currentId;

                    return (
                        sameNumber &&
                        differentId
                    );
                }
            );

        if (duplicatedOrder) {
            showOrderNumberError(
                "Já existe uma Ordem de Serviço com esse número."
            );

            dom.orderNumber?.focus();

            return;
        }

        setSaveButtonLoading(true);

        try {
            let savedRow;

            if (
                state.modalMode ===
                "edit"
            ) {
                const {
                    data,
                    error
                } =
                    await window.supabaseClient
                        .from(
                            "ordens_servico"
                        )
                        .update(payload)
                        .eq(
                            "id",
                            currentId
                        )
                        .select("*")
                        .single();

                if (error) {
                    throw error;
                }

                savedRow = data;
            } else {
                const {
                    data,
                    error
                } =
                    await window.supabaseClient
                        .from(
                            "ordens_servico"
                        )
                        .insert(payload)
                        .select("*")
                        .single();

                if (error) {
                    throw error;
                }

                savedRow = data;
            }

            const savedOrder =
                mapDatabaseOrder(
                    savedRow
                );

            if (
                state.modalMode ===
                "edit"
            ) {
                const index =
                    state.orders.findIndex(
                        (order) =>
                            String(
                                order.id
                            ) ===
                            String(
                                savedOrder.id
                            )
                    );

                if (index >= 0) {
                    state.orders[index] =
                        savedOrder;
                }

                showToast(
                    "Ordem atualizada",
                    `${savedOrder.numero} foi atualizada no banco de dados.`,
                    "success"
                );
            } else {
                state.orders.unshift(
                    savedOrder
                );

                showToast(
                    "Ordem cadastrada",
                    `${savedOrder.numero} foi salva no banco de dados.`,
                    "success"
                );
            }

            state.activities =
                buildActivities(
                    state.orders
                );

            state.currentPage = 1;

            applyFilters();
            renderActivities();

            closeOrderModal();
        } catch (error) {
            console.error(
                "Erro ao salvar a Ordem de Serviço:",
                error
            );

            if (
                String(
                    error?.code || ""
                ) === "23505"
            ) {
                showOrderNumberError(
                    "Esse número de Ordem de Serviço ou código de consulta já está cadastrado."
                );

                dom.orderNumber?.focus();
            } else {
                showToast(
                    "Não foi possível salvar",
                    translateDatabaseError(
                        error
                    ),
                    "error"
                );
            }
        } finally {
            setSaveButtonLoading(false);
        }
    }


    function validateOrderForm() {
        const requiredFields = [
            {
                field:
                    dom.orderNumber,

                message:
                    "Informe o número da Ordem de Serviço."
            },
            {
                field:
                    dom.openingDate,

                message:
                    "Informe a data de abertura."
            },
            {
                field:
                    dom.clientName,

                message:
                    "Informe o nome do cliente."
            },
            {
                field:
                    dom.serviceCategory,

                message:
                    "Selecione a categoria do serviço."
            },
            {
                field:
                    dom.serviceTitle,

                message:
                    "Informe o serviço ou título da Ordem de Serviço."
            },
            {
                field:
                    dom.orderStatus,

                message:
                    "Selecione o status da Ordem de Serviço."
            },
            {
                field:
                    dom.orderPriority,

                message:
                    "Selecione a prioridade."
            }
        ];

        for (
            const item of requiredFields
        ) {
            if (
                !String(
                    item.field?.value || ""
                ).trim()
            ) {
                return {
                    valid: false,
                    message:
                        item.message,
                    field:
                        item.field
                };
            }
        }

        if (
            dom.clientEmail?.value &&
            !isValidEmail(
                dom.clientEmail.value
            )
        ) {
            return {
                valid: false,

                message:
                    "Informe um endereço de e-mail válido.",

                field:
                    dom.clientEmail
            };
        }

        if (
            dom.orderStatus?.value ===
                "concluida" &&
            !dom.completionDate?.value
        ) {
            return {
                valid: false,

                message:
                    "Informe a data de conclusão da Ordem de Serviço.",

                field:
                    dom.completionDate
            };
        }

        return {
            valid: true,
            message: "",
            field: null
        };
    }


    function setSaveButtonLoading(
        loading
    ) {
        if (!dom.saveOrderButton) {
            return;
        }

        dom.saveOrderButton.disabled =
            loading;

        if (loading) {
            dom.saveOrderButton.dataset
                .originalContent =
                dom.saveOrderButton
                    .innerHTML;

            dom.saveOrderButton.innerHTML = `
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                Salvando...
            `;

            return;
        }

        const originalContent =
            dom.saveOrderButton.dataset
                .originalContent;

        if (originalContent) {
            dom.saveOrderButton.innerHTML =
                originalContent;

            delete dom.saveOrderButton
                .dataset.originalContent;
        }
    }


    function handleTableAction(event) {
        const button =
            event.target.closest(
                "[data-action][data-id]"
            );

        if (!button) {
            return;
        }

        const action =
            button.dataset.action;

        const orderId =
            button.dataset.id;

        if (action === "view") {
            openOrderModal(
                "view",
                orderId
            );

            return;
        }

        if (action === "edit") {
            openOrderModal(
                "edit",
                orderId
            );

            return;
        }

        if (action === "delete") {
            openDeleteModal(
                orderId
            );
        }
    }


    function openDeleteModal(orderId) {
        const order =
            state.orders.find(
                (item) =>
                    String(item.id) ===
                    String(orderId)
            );

        if (
            !order ||
            !dom.deleteModal
        ) {
            showToast(
                "Registro não encontrado",
                "A Ordem de Serviço selecionada não está disponível.",
                "error"
            );

            return;
        }

        state.selectedDeleteId =
            order.id;

        if (dom.deleteOrderNumber) {
            dom.deleteOrderNumber
                .textContent =
                order.numero;
        }

        dom.deleteModal.classList.add(
            "active"
        );

        dom.deleteModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        window.setTimeout(() => {
            dom.confirmDelete?.focus();
        }, 80);
    }


    function closeDeleteModal() {
        if (!dom.deleteModal) {
            return;
        }

        dom.deleteModal.classList.remove(
            "active"
        );

        dom.deleteModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        state.selectedDeleteId =
            null;

        if (dom.deleteOrderNumber) {
            dom.deleteOrderNumber
                .textContent = "";
        }

        if (dom.confirmDelete) {
            dom.confirmDelete.disabled =
                false;

            dom.confirmDelete.innerHTML = `
                <i class="fa-solid fa-trash"></i>
                Excluir
            `;
        }
    }


    async function confirmDeleteOrder() {
        const orderId =
            state.selectedDeleteId;

        if (!orderId) {
            closeDeleteModal();

            return;
        }

        const order =
            state.orders.find(
                (item) =>
                    String(item.id) ===
                    String(orderId)
            );

        if (!order) {
            closeDeleteModal();

            return;
        }

        setDeleteButtonLoading(true);

        try {
            const {
                error
            } =
                await window.supabaseClient
                    .from(
                        "ordens_servico"
                    )
                    .delete()
                    .eq(
                        "id",
                        orderId
                    );

            if (error) {
                throw error;
            }

            state.orders =
                state.orders.filter(
                    (item) =>
                        String(item.id) !==
                        String(orderId)
                );

            state.activities =
                buildActivities(
                    state.orders
                );

            applyFilters();
            renderActivities();

            closeDeleteModal();

            showToast(
                "Ordem excluída",
                `${order.numero} foi removida do banco de dados.`,
                "success"
            );
        } catch (error) {
            console.error(
                "Erro ao excluir a Ordem de Serviço:",
                error
            );

            setDeleteButtonLoading(false);

            showToast(
                "Não foi possível excluir",
                translateDatabaseError(
                    error
                ),
                "error"
            );
        }
    }


    function setDeleteButtonLoading(
        loading
    ) {
        if (!dom.confirmDelete) {
            return;
        }

        dom.confirmDelete.disabled =
            loading;

        dom.confirmDelete.innerHTML =
            loading
                ? `
                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                    Excluindo...
                `
                : `
                    <i class="fa-solid fa-trash"></i>
                    Excluir
                `;
    }


    function generateNextOrderNumber() {
        const year =
            new Date().getFullYear();

        const prefix =
            `OS-${year}-`;

        const numbers =
            state.orders
                .map((order) => {
                    const number =
                        String(
                            order.numero || ""
                        ).toUpperCase();

                    if (
                        !number.startsWith(
                            prefix
                        )
                    ) {
                        return 0;
                    }

                    return Number(
                        number.replace(
                            prefix,
                            ""
                        )
                    ) || 0;
                });

        const nextNumber =
            Math.max(
                0,
                ...numbers
            ) + 1;

        return (
            prefix +
            String(nextNumber)
                .padStart(
                    4,
                    "0"
                )
        );
    }


    function showOrderNumberError(
        message
    ) {
        if (dom.orderNumberError) {
            dom.orderNumberError
                .textContent =
                message;

            dom.orderNumberError
                .style.display =
                "block";
        }

        dom.orderNumber
            ?.classList.add(
                "input-error"
            );
    }


    function clearOrderNumberError() {
        if (dom.orderNumberError) {
            dom.orderNumberError
                .textContent = "";

            dom.orderNumberError
                .style.display =
                "none";
        }

        dom.orderNumber
            ?.classList.remove(
                "input-error"
            );
    }
       function applyFilters() {
        const searchTerm =
            normalizeText(
                dom.searchOrder?.value || ""
            );

        const selectedStatus =
            dom.statusFilter?.value || "";

        const selectedPriority =
            dom.priorityFilter?.value || "";

        state.filteredOrders =
            [...state.orders]
                .filter((order) => {
                    const searchableText =
                        normalizeText(
                            [
                                order.numero,
                                order.codigoConsulta,
                                order.cliente,
                                order.telefone,
                                order.email,
                                order.servico,
                                order.equipamento,
                                order.marcaModelo,
                                order.numeroSerie,
                                order.tecnico,
                                categoryLabels[
                                    order.categoria
                                ] ||
                                order.categoria
                            ]
                                .filter(Boolean)
                                .join(" ")
                        );

                    const matchesSearch =
                        !searchTerm ||
                        searchableText.includes(
                            searchTerm
                        );

                    const matchesStatus =
                        !selectedStatus ||
                        order.status ===
                            selectedStatus;

                    const matchesPriority =
                        !selectedPriority ||
                        order.prioridade ===
                            selectedPriority;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesPriority
                    );
                })
                .sort(sortOrders);

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    state.filteredOrders
                        .length /
                    PAGE_SIZE
                )
            );

        state.currentPage =
            Math.min(
                state.currentPage,
                totalPages
            );

        renderOrders();
        updateStats();
        updatePagination();
    }


    function sortOrders(a, b) {
        const dateA =
            new Date(
                a.atualizadoEm ||
                a.criadoEm ||
                a.dataAbertura ||
                0
            ).getTime();

        const dateB =
            new Date(
                b.atualizadoEm ||
                b.criadoEm ||
                b.dataAbertura ||
                0
            ).getTime();

        return dateB - dateA;
    }


    function renderOrders() {
        if (!dom.ordersTableBody) {
            return;
        }

        if (
            state.filteredOrders
                .length === 0
        ) {
            dom.ordersTableBody.innerHTML = `
                <tr>

                    <td colspan="7">

                        <div class="empty-state">

                            <i
                                class="fa-solid fa-magnifying-glass"
                                aria-hidden="true"
                            ></i>

                            <h4>
                                Nenhuma Ordem de Serviço encontrada
                            </h4>

                            <p>
                                Altere os filtros ou cadastre uma nova
                                Ordem de Serviço.
                            </p>

                        </div>

                    </td>

                </tr>
            `;

            return;
        }

        const start =
            (
                state.currentPage -
                1
            ) *
            PAGE_SIZE;

        const pageOrders =
            state.filteredOrders.slice(
                start,
                start + PAGE_SIZE
            );

        dom.ordersTableBody.innerHTML =
            pageOrders
                .map(createOrderRow)
                .join("");
    }


    function createOrderRow(order) {
        const status =
            statusLabels[
                order.status
            ] ||
            "Não informado";

        const statusClass =
            statusClasses[
                order.status
            ] ||
            "status-rascunho";

        const priority =
            priorityLabels[
                order.prioridade
            ] ||
            "Normal";

        const priorityClass =
            priorityClasses[
                order.prioridade
            ] ||
            "badge-neutral";

        const clientType =
            clientTypeLabels[
                order.tipoCliente
            ] ||
            "Não informado";

        const category =
            categoryLabels[
                order.categoria
            ] ||
            "Não informada";

        const portalCode =
            order.codigoConsulta
                ? `Código: ${order.codigoConsulta}`
                : getUpdateLabel(order);

        return `
            <tr
                data-order-id="${escapeHtml(
                    order.id
                )}"
            >

                <td>

                    <span class="table-primary">
                        ${escapeHtml(
                            order.numero
                        )}
                    </span>

                    <span class="table-secondary">
                        ${escapeHtml(
                            portalCode
                        )}
                    </span>

                </td>


                <td>

                    <span class="table-primary">
                        ${escapeHtml(
                            order.cliente
                        )}
                    </span>

                    <span class="table-secondary">
                        ${escapeHtml(
                            clientType
                        )}
                    </span>

                </td>


                <td>

                    <span class="table-primary">
                        ${escapeHtml(
                            order.servico
                        )}
                    </span>

                    <span class="table-secondary">
                        ${escapeHtml(
                            category
                        )}
                    </span>

                </td>


                <td>
                    ${escapeHtml(
                        formatDate(
                            order.dataAbertura
                        )
                    )}
                </td>


                <td>

                    <span
                        class="badge ${escapeHtml(
                            statusClass
                        )}"
                    >
                        ${escapeHtml(
                            status
                        )}
                    </span>

                </td>


                <td>

                    <span
                        class="badge ${escapeHtml(
                            priorityClass
                        )}"
                    >
                        ${escapeHtml(
                            priority
                        )}
                    </span>

                </td>


                <td>

                    <div class="table-actions">

                        <button
                            type="button"
                            class="btn btn-icon btn-sm"
                            data-action="view"
                            data-id="${escapeHtml(
                                order.id
                            )}"
                            title="Visualizar"
                            aria-label="Visualizar ${escapeHtml(
                                order.numero
                            )}"
                        >

                            <i
                                class="fa-solid fa-eye"
                                aria-hidden="true"
                            ></i>

                        </button>


                        <button
                            type="button"
                            class="btn btn-icon btn-sm"
                            data-action="edit"
                            data-id="${escapeHtml(
                                order.id
                            )}"
                            title="Editar"
                            aria-label="Editar ${escapeHtml(
                                order.numero
                            )}"
                        >

                            <i
                                class="fa-solid fa-pen"
                                aria-hidden="true"
                            ></i>

                        </button>


                        <button
                            type="button"
                            class="btn btn-icon btn-sm danger"
                            data-action="delete"
                            data-id="${escapeHtml(
                                order.id
                            )}"
                            title="Excluir"
                            aria-label="Excluir ${escapeHtml(
                                order.numero
                            )}"
                        >

                            <i
                                class="fa-solid fa-trash"
                                aria-hidden="true"
                            ></i>

                        </button>

                    </div>

                </td>

            </tr>
        `;
    }


    function updateStats() {
        const total =
            state.orders.length;

        const inProgress =
            state.orders.filter(
                (order) =>
                    order.status ===
                    "andamento"
            ).length;

        const pending =
            state.orders.filter(
                (order) =>
                    order.status ===
                    "pendente"
            ).length;

        const completed =
            state.orders.filter(
                (order) =>
                    order.status ===
                    "concluida"
            ).length;

        setText(
            dom.totalOrders,
            total
        );

        setText(
            dom.ordersInProgress,
            inProgress
        );

        setText(
            dom.pendingOrders,
            pending
        );

        setText(
            dom.completedOrders,
            completed
        );
    }


    function updatePagination() {
        const total =
            state.filteredOrders.length;

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    total /
                    PAGE_SIZE
                )
            );

        const start =
            total === 0
                ? 0
                : (
                    state.currentPage -
                    1
                ) *
                PAGE_SIZE +
                1;

        const end =
            Math.min(
                state.currentPage *
                PAGE_SIZE,
                total
            );

        if (dom.paginationInfo) {
            dom.paginationInfo.textContent =
                total === 0
                    ? "Nenhum registro encontrado"
                    : (
                        `Exibindo ${start}–${end} ` +
                        `de ${total} ` +
                        `${total === 1
                            ? "registro"
                            : "registros"
                        }`
                    );
        }

        if (dom.previousPage) {
            dom.previousPage.disabled =
                state.currentPage <= 1;
        }

        if (dom.nextPage) {
            dom.nextPage.disabled =
                state.currentPage >=
                totalPages;
        }

        if (
            dom.currentPageButton
        ) {
            dom.currentPageButton
                .textContent =
                String(
                    state.currentPage
                );

            dom.currentPageButton
                .setAttribute(
                    "aria-label",
                    (
                        `Página ` +
                        `${state.currentPage} ` +
                        `de ${totalPages}`
                    )
                );
        }
    }


    function previousPage() {
        if (
            state.currentPage <= 1
        ) {
            return;
        }

        state.currentPage -= 1;

        renderOrders();
        updatePagination();
        scrollToOrders();
    }


    function nextPage() {
        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    state.filteredOrders
                        .length /
                    PAGE_SIZE
                )
            );

        if (
            state.currentPage >=
            totalPages
        ) {
            return;
        }

        state.currentPage += 1;

        renderOrders();
        updatePagination();
        scrollToOrders();
    }


    function scrollToOrders() {
        document
            .getElementById(
                "ordens-servico"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    }


    function clearFilters() {
        if (dom.searchOrder) {
            dom.searchOrder.value =
                "";
        }

        if (dom.statusFilter) {
            dom.statusFilter.value =
                "";
        }

        if (dom.priorityFilter) {
            dom.priorityFilter.value =
                "";
        }

        state.currentPage = 1;

        applyFilters();

        showToast(
            "Filtros limpos",
            "Todas as Ordens de Serviço estão sendo exibidas.",
            "success"
        );
    }


    function renderActivities() {
        if (!dom.activityList) {
            return;
        }

        const latestActivities =
            [...state.activities]
                .sort(
                    (a, b) => {
                        return (
                            new Date(
                                b.date || 0
                            ).getTime() -
                            new Date(
                                a.date || 0
                            ).getTime()
                        );
                    }
                )
                .slice(
                    0,
                    5
                );

        if (
            latestActivities.length ===
            0
        ) {
            dom.activityList.innerHTML = `
                <div class="empty-state">

                    <i
                        class="fa-solid fa-clock-rotate-left"
                        aria-hidden="true"
                    ></i>

                    <h4>
                        Nenhuma atividade registrada
                    </h4>

                    <p>
                        As movimentações das Ordens de Serviço
                        aparecerão aqui.
                    </p>

                </div>
            `;

            return;
        }

        dom.activityList.innerHTML =
            latestActivities
                .map((activity) => {
                    const icon =
                        activityIcons[
                            activity.type
                        ] ||
                        "fa-circle-info";

                    return `
                        <article class="activity-item">

                            <span class="activity-icon">

                                <i
                                    class="fa-solid ${escapeHtml(
                                        icon
                                    )}"
                                    aria-hidden="true"
                                ></i>

                            </span>


                            <div class="activity-content">

                                <strong>
                                    ${escapeHtml(
                                        activity.title
                                    )}
                                </strong>

                                <p>
                                    ${escapeHtml(
                                        activity.text
                                    )}
                                </p>

                                <span class="activity-time">
                                    ${escapeHtml(
                                        formatDateTime(
                                            activity.date
                                        )
                                    )}
                                </span>

                            </div>

                        </article>
                    `;
                })
                .join("");
    }
       function exportOrdersToCsv() {
        if (state.filteredOrders.length === 0) {
            showToast(
                "Nada para exportar",
                "Nenhuma Ordem de Serviço corresponde aos filtros atuais.",
                "warning"
            );

            return;
        }

        const headers = [
            "Número da OS",
            "Código de consulta",
            "Data de abertura",
            "Cliente",
            "Tipo de cliente",
            "Telefone",
            "E-mail",
            "Endereço",
            "Categoria",
            "Serviço",
            "Status",
            "Prioridade",
            "Técnico",
            "Equipamento",
            "Marca / modelo",
            "Número de série",
            "Problema relatado",
            "Diagnóstico",
            "Serviço executado",
            "Materiais",
            "Observações",
            "Data de conclusão",
            "Próxima manutenção",
            "Garantia até",
            "Visível no portal",
            "Criado em",
            "Atualizado em"
        ];

        const rows = state.filteredOrders.map((order) => [
            order.numero,
            order.codigoConsulta,
            formatDate(order.dataAbertura),
            order.cliente,
            clientTypeLabels[order.tipoCliente] ||
                order.tipoCliente,
            order.telefone,
            order.email,
            order.endereco,
            categoryLabels[order.categoria] ||
                order.categoria,
            order.servico,
            statusLabels[order.status] ||
                order.status,
            priorityLabels[order.prioridade] ||
                order.prioridade,
            order.tecnico,
            order.equipamento,
            order.marcaModelo,
            order.numeroSerie,
            order.problemaRelatado,
            order.diagnostico,
            order.servicoExecutado,
            order.materiais,
            order.observacoes,
            formatDate(order.dataConclusao),
            formatDate(order.proximaManutencao),
            formatDate(order.garantiaAte),
            order.visivelNoPortal
                ? "Sim"
                : "Não",
            formatDateTime(order.criadoEm),
            formatDateTime(order.atualizadoEm)
        ]);

        const csv = [headers, ...rows]
            .map((row) => {
                return row
                    .map(csvEscape)
                    .join(";");
            })
            .join("\r\n");

        const blob = new Blob(
            [
                "\uFEFF",
                csv
            ],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `ordens-de-servico-${todayIso()}.csv`;

        link.style.display =
            "none";

        document.body.appendChild(
            link
        );

        link.click();
        link.remove();

        window.setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 500);

        showToast(
            "Exportação concluída",
            `${state.filteredOrders.length} ${
                state.filteredOrders.length === 1
                    ? "registro foi exportado."
                    : "registros foram exportados."
            }`,
            "success"
        );
    }


    function csvEscape(value) {
        let text =
            String(value ?? "");

        /*
         * Evita que valores exportados sejam interpretados
         * como fórmulas pelo Excel.
         */
        if (/^[=+\-@]/.test(text)) {
            text = `'${text}`;
        }

        text = text.replace(
            /"/g,
            '""'
        );

        return `"${text}"`;
    }


    function toggleSidebar() {
        const isOpen =
            dom.sidebar
                ?.classList
                .toggle("active") ||
            false;

        dom.sidebarOverlay
            ?.classList
            .toggle(
                "active",
                isOpen
            );

        dom.sidebarOverlay
            ?.setAttribute(
                "aria-hidden",
                String(!isOpen)
            );

        dom.menuToggle
            ?.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
    }


    function closeSidebar() {
        dom.sidebar
            ?.classList
            .remove("active");

        dom.sidebarOverlay
            ?.classList
            .remove("active");

        dom.sidebarOverlay
            ?.setAttribute(
                "aria-hidden",
                "true"
            );

        dom.menuToggle
            ?.setAttribute(
                "aria-expanded",
                "false"
            );
    }


    function handleMenuClick(event) {
        event.preventDefault();

        const item =
            event.currentTarget;

        const sectionName =
            item.dataset.section;

        const section =
            sectionName
                ? document.getElementById(
                    sectionName
                )
                : null;

        dom.menuItems.forEach(
            (menuItem) => {
                menuItem.classList.remove(
                    "active"
                );
            }
        );

        item.classList.add(
            "active"
        );

        closeSidebar();

        if (!section) {
            showToast(
                "Módulo em desenvolvimento",
                "Esta área será criada em uma próxima etapa do painel.",
                "warning"
            );

            return;
        }

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        if (sectionName) {
            window.history.replaceState(
                null,
                "",
                `#${sectionName}`
            );
        }
    }


    function handleEscapeKey(event) {
        if (event.key !== "Escape") {
            return;
        }

        if (
            dom.deleteModal
                ?.classList
                .contains("active")
        ) {
            closeDeleteModal();

            return;
        }

        if (
            dom.orderModal
                ?.classList
                .contains("active")
        ) {
            closeOrderModal();

            return;
        }

        closeSidebar();
    }


    function showToast(
        title,
        message,
        type = "success"
    ) {
        if (!dom.toastContainer) {
            console.log(
                `${title}: ${message}`
            );

            return;
        }

        const icons = {
            success:
                "fa-circle-check",

            warning:
                "fa-triangle-exclamation",

            error:
                "fa-circle-xmark",

            info:
                "fa-circle-info"
        };

        const toast =
            document.createElement(
                "div"
            );

        toast.className =
            `toast ${type}`;

        toast.setAttribute(
            "role",
            type === "error"
                ? "alert"
                : "status"
        );

        toast.innerHTML = `
            <span class="toast-icon">

                <i
                    class="fa-solid ${escapeHtml(
                        icons[type] ||
                        icons.info
                    )}"
                    aria-hidden="true"
                ></i>

            </span>

            <div class="toast-content">

                <strong>
                    ${escapeHtml(title)}
                </strong>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>

            <button
                class="toast-close"
                type="button"
                aria-label="Fechar notificação"
            >

                <i
                    class="fa-solid fa-xmark"
                    aria-hidden="true"
                ></i>

            </button>
        `;

        toast
            .querySelector(
                ".toast-close"
            )
            ?.addEventListener(
                "click",
                () => {
                    removeToast(
                        toast
                    );
                }
            );

        dom.toastContainer.appendChild(
            toast
        );

        window.setTimeout(() => {
            removeToast(toast);
        }, 5000);
    }


    function removeToast(toast) {
        if (!toast?.isConnected) {
            return;
        }

        toast.style.opacity =
            "0";

        toast.style.transform =
            "translateY(-8px)";

        window.setTimeout(() => {
            toast.remove();
        }, 220);
    }


    function applyPhoneMask(event) {
        const input =
            event.currentTarget;

        let value =
            input.value
                .replace(/\D/g, "")
                .slice(0, 11);

        if (value.length > 10) {
            value = value.replace(
                /^(\d{2})(\d{5})(\d{0,4}).*/,
                "($1) $2-$3"
            );
        } else if (
            value.length > 6
        ) {
            value = value.replace(
                /^(\d{2})(\d{4})(\d{0,4}).*/,
                "($1) $2-$3"
            );
        } else if (
            value.length > 2
        ) {
            value = value.replace(
                /^(\d{2})(\d+)/,
                "($1) $2"
            );
        } else if (
            value.length > 0
        ) {
            value = value.replace(
                /^(\d*)/,
                "($1"
            );
        }

        input.value = value;
    }


    function updateCurrentDate() {
        if (!dom.currentDate) {
            return;
        }

        const formattedDate =
            new Intl.DateTimeFormat(
                "pt-BR",
                {
                    weekday:
                        "long",

                    day:
                        "2-digit",

                    month:
                        "long",

                    year:
                        "numeric"
                }
            ).format(
                new Date()
            );

        dom.currentDate.textContent =
            formattedDate
                .charAt(0)
                .toUpperCase() +
            formattedDate.slice(1);
    }


    function getUpdateLabel(order) {
        if (
            order.status ===
            "concluida"
        ) {
            return "Finalizada";
        }

        const value =
            order.atualizadoEm ||
            order.criadoEm ||
            order.dataAbertura;

        if (!value) {
            return (
                "Sem atualização informada"
            );
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return (
                `Atualizada em ` +
                `${formatDate(value)}`
            );
        }

        const today =
            startOfDay(
                new Date()
            );

        const updatedDay =
            startOfDay(date);

        const difference =
            Math.round(
                (
                    today.getTime() -
                    updatedDay.getTime()
                ) /
                86400000
            );

        if (difference === 0) {
            return "Atualizada hoje";
        }

        if (difference === 1) {
            return "Atualizada ontem";
        }

        return (
            `Atualizada em ` +
            `${formatDate(value)}`
        );
    }


    function formatDate(value) {
        if (!value) {
            return "—";
        }

        const date =
            parseLocalDate(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        return new Intl.DateTimeFormat(
            "pt-BR"
        ).format(date);
    }


    function formatDateTime(value) {
        if (!value) {
            return (
                "Data não informada"
            );
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        const today =
            startOfDay(
                new Date()
            );

        const activityDay =
            startOfDay(date);

        const difference =
            Math.round(
                (
                    today.getTime() -
                    activityDay.getTime()
                ) /
                86400000
            );

        const time =
            new Intl.DateTimeFormat(
                "pt-BR",
                {
                    hour:
                        "2-digit",

                    minute:
                        "2-digit"
                }
            ).format(date);

        if (difference === 0) {
            return `Hoje, às ${time}`;
        }

        if (difference === 1) {
            return `Ontem, às ${time}`;
        }

        const dateText =
            new Intl.DateTimeFormat(
                "pt-BR"
            ).format(date);

        return (
            `${dateText}, às ${time}`
        );
    }


    function parseLocalDate(value) {
        const text =
            String(value);

        const datePart =
            text.slice(0, 10);

        const match =
            datePart.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );

        if (match) {
            return new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            );
        }

        return new Date(value);
    }


    function startOfDay(date) {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );
    }


    function todayIso() {
        const date =
            new Date();

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );

        return (
            `${year}-${month}-${day}`
        );
    }


    function getFormValue(
        formData,
        fieldName,
        defaultValue = ""
    ) {
        const value =
            formData.get(
                fieldName
            );

        if (
            value === null ||
            value === undefined
        ) {
            return defaultValue;
        }

        const text =
            String(value).trim();

        return (
            text ||
            defaultValue
        );
    }


    function nullIfEmpty(value) {
        const text =
            String(
                value ?? ""
            ).trim();

        return text || null;
    }


    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(
                String(
                    value || ""
                ).trim()
            );
    }


    function normalizeText(value) {
        return String(
            value ?? ""
        )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .trim();
    }


    function escapeHtml(value) {
        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    function setText(
        element,
        value
    ) {
        if (element) {
            element.textContent =
                String(value);
        }
    }


    function translateDatabaseError(
        error
    ) {
        const code =
            String(
                error?.code || ""
            );

        const message =
            String(
                error?.message || ""
            ).toLowerCase();

        if (
            code === "23505" ||
            message.includes(
                "duplicate key"
            )
        ) {
            return (
                "Já existe um registro com esse número de OS " +
                "ou código de consulta."
            );
        }

        if (
            code === "23514" ||
            message.includes(
                "check constraint"
            )
        ) {
            return (
                "Um dos campos possui um valor não permitido pelo banco de dados."
            );
        }

        if (
            code === "23502" ||
            message.includes(
                "not-null constraint"
            )
        ) {
            return (
                "Um campo obrigatório não foi preenchido corretamente."
            );
        }

        if (
            code === "42501" ||
            message.includes(
                "row-level security"
            ) ||
            message.includes(
                "permission denied"
            )
        ) {
            return (
                "Seu usuário não possui permissão para realizar esta operação. " +
                "Saia do painel e entre novamente."
            );
        }

        if (
            code === "PGRST116" ||
            message.includes(
                "json object requested"
            )
        ) {
            return (
                "O registro não foi encontrado ou sua sessão não possui acesso a ele."
            );
        }

        if (
            message.includes("jwt") ||
            message.includes("token") ||
            message.includes("session")
        ) {
            return (
                "Sua sessão pode ter expirado. " +
                "Saia do painel e faça o login novamente."
            );
        }

        if (
            message.includes(
                "failed to fetch"
            ) ||
            message.includes(
                "network"
            ) ||
            message.includes(
                "load failed"
            )
        ) {
            return (
                "Não foi possível conectar ao banco de dados. " +
                "Verifique sua internet e tente novamente."
            );
        }

        return (
            "O banco de dados não conseguiu concluir a operação. " +
            "Tente novamente e confira o console do navegador se o problema continuar."
        );
    }
})();
