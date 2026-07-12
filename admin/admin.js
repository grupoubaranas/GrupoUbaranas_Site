/* ==========================================================
   GRUPO UBARANAS
   PAINEL ADMINISTRATIVO — JAVASCRIPT V1.0
   Arquivo: admin/admin.js

   Esta versão funciona no navegador usando localStorage.
   Os dados ficam salvos somente no navegador utilizado.
   A conexão com banco de dados será feita em uma próxima etapa.
========================================================== */

"use strict";

(() => {
    const STORAGE_KEY = "grupoUbaranas.admin.orders.v1";
    const ACTIVITY_KEY = "grupoUbaranas.admin.activities.v1";
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

    const demoOrders = [
        {
            id: "demo-os-0004",
            numero: "OS-2026-0004",
            dataAbertura: "2026-07-12",
            cliente: "Cliente demonstrativo",
            tipoCliente: "comercial",
            telefone: "",
            email: "",
            endereco: "",
            categoria: "manutencao",
            servico: "Manutenção de nobreak",
            status: "andamento",
            prioridade: "alta",
            tecnico: "Felipe Augusto",
            equipamento: "Nobreak 3 kVA",
            marcaModelo: "",
            numeroSerie: "",
            problemaRelatado: "Equipamento entrando em falha durante a transferência de carga.",
            diagnostico: "",
            servicoExecutado: "",
            materiais: "",
            observacoes: "Registro demonstrativo.",
            dataConclusao: "",
            proximaManutencao: "",
            garantiaAte: "",
            visivelNoPortal: true,
            criadoEm: "2026-07-12T10:35:00",
            atualizadoEm: "2026-07-12T10:35:00"
        },
        {
            id: "demo-os-0003",
            numero: "OS-2026-0003",
            dataAbertura: "2026-07-11",
            cliente: "Cliente demonstrativo",
            tipoCliente: "condominio",
            telefone: "",
            email: "",
            endereco: "",
            categoria: "eletrica",
            servico: "Adequação elétrica",
            status: "pendente",
            prioridade: "normal",
            tecnico: "Felipe Augusto",
            equipamento: "Quadro de distribuição",
            marcaModelo: "",
            numeroSerie: "",
            problemaRelatado: "Necessidade de adequação e organização do quadro elétrico.",
            diagnostico: "",
            servicoExecutado: "",
            materiais: "",
            observacoes: "Registro demonstrativo.",
            dataConclusao: "",
            proximaManutencao: "",
            garantiaAte: "",
            visivelNoPortal: true,
            criadoEm: "2026-07-11T17:20:00",
            atualizadoEm: "2026-07-11T17:20:00"
        },
        {
            id: "demo-os-0002",
            numero: "OS-2026-0002",
            dataAbertura: "2026-07-08",
            cliente: "Cliente demonstrativo",
            tipoCliente: "comercial",
            telefone: "",
            email: "",
            endereco: "",
            categoria: "rede",
            servico: "Organização de rack",
            status: "concluida",
            prioridade: "normal",
            tecnico: "Felipe Augusto",
            equipamento: "Rack de rede",
            marcaModelo: "",
            numeroSerie: "",
            problemaRelatado: "Organização e identificação do cabeamento.",
            diagnostico: "Cabeamento sem identificação e com distribuição inadequada.",
            servicoExecutado: "Organização, identificação e acomodação dos cabos de rede.",
            materiais: "Abraçadeiras e etiquetas de identificação.",
            observacoes: "Registro demonstrativo.",
            dataConclusao: "2026-07-08",
            proximaManutencao: "",
            garantiaAte: "",
            visivelNoPortal: true,
            criadoEm: "2026-07-08T09:15:00",
            atualizadoEm: "2026-07-08T16:10:00"
        },
        {
            id: "demo-os-0001",
            numero: "OS-2026-0001",
            dataAbertura: "2026-07-05",
            cliente: "Cliente demonstrativo",
            tipoCliente: "residencial",
            telefone: "",
            email: "",
            endereco: "",
            categoria: "seguranca-eletronica",
            servico: "Instalação de câmeras",
            status: "concluida",
            prioridade: "baixa",
            tecnico: "Felipe Augusto",
            equipamento: "Sistema de CFTV",
            marcaModelo: "",
            numeroSerie: "",
            problemaRelatado: "Solicitação de instalação de sistema de monitoramento.",
            diagnostico: "",
            servicoExecutado: "Instalação e configuração das câmeras e do gravador.",
            materiais: "",
            observacoes: "Registro demonstrativo.",
            dataConclusao: "2026-07-05",
            proximaManutencao: "",
            garantiaAte: "",
            visivelNoPortal: true,
            criadoEm: "2026-07-05T08:00:00",
            atualizadoEm: "2026-07-05T17:30:00"
        }
    ];

    const demoActivities = [
        {
            id: "activity-demo-1",
            type: "create",
            title: "Nova ordem de serviço cadastrada",
            text: "A OS-2026-0004 foi adicionada ao sistema.",
            date: "2026-07-12T10:35:00"
        },
        {
            id: "activity-demo-2",
            type: "edit",
            title: "Status atualizado",
            text: "A OS-2026-0003 foi alterada para pendente.",
            date: "2026-07-11T17:20:00"
        },
        {
            id: "activity-demo-3",
            type: "complete",
            title: "Serviço concluído",
            text: "A OS-2026-0002 foi finalizada e liberada para consulta.",
            date: "2026-07-08T16:10:00"
        }
    ];

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
        modalMode: "create"
    };

    const dom = {};

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        cacheDom();
        loadData();
        bindEvents();
        updateCurrentDate();
        applyFilters();
        renderActivities();
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
            "toastContainer"
        ];

        ids.forEach((id) => {
            dom[id] = document.getElementById(id);
        });

        dom.currentPageButton = document.querySelector(
            ".pagination .page-button.active"
        );
        dom.menuItems = Array.from(document.querySelectorAll(".menu-item"));
        dom.formFields = dom.orderForm
            ? Array.from(dom.orderForm.querySelectorAll("input, select, textarea"))
            : [];
    }

    function bindEvents() {
        dom.menuToggle?.addEventListener("click", toggleSidebar);
        dom.sidebarOverlay?.addEventListener("click", closeSidebar);

        dom.menuItems.forEach((item) => {
            item.addEventListener("click", handleMenuClick);
        });

        dom.newOrderButton?.addEventListener("click", () => openOrderModal("create"));
        dom.quickNewOrder?.addEventListener("click", () => openOrderModal("create"));

        dom.quickNewClient?.addEventListener("click", () => {
            openOrderModal("create");
            window.setTimeout(() => dom.clientName?.focus(), 80);
        });

        dom.quickMaintenance?.addEventListener("click", () => {
            openOrderModal("create");
            window.setTimeout(() => dom.nextMaintenance?.focus(), 80);
            showToast(
                "Programação de manutenção",
                "Preencha os dados da OS e informe a data da próxima manutenção.",
                "warning"
            );
        });

        dom.quickReport?.addEventListener("click", exportOrdersToCsv);
        dom.exportOrders?.addEventListener("click", exportOrdersToCsv);

        dom.searchOrder?.addEventListener("input", () => {
            state.currentPage = 1;
            applyFilters();
        });

        dom.statusFilter?.addEventListener("change", () => {
            state.currentPage = 1;
            applyFilters();
        });

        dom.priorityFilter?.addEventListener("change", () => {
            state.currentPage = 1;
            applyFilters();
        });

        dom.clearFilters?.addEventListener("click", clearFilters);
        dom.previousPage?.addEventListener("click", previousPage);
        dom.nextPage?.addEventListener("click", nextPage);

        dom.ordersTableBody?.addEventListener("click", handleTableAction);

        dom.closeOrderModal?.addEventListener("click", closeOrderModal);
        dom.cancelOrderModal?.addEventListener("click", closeOrderModal);
        dom.orderForm?.addEventListener("submit", saveOrder);

        dom.closeDeleteModal?.addEventListener("click", closeDeleteModal);
        dom.cancelDelete?.addEventListener("click", closeDeleteModal);
        dom.confirmDelete?.addEventListener("click", confirmDeleteOrder);

        dom.orderModal?.addEventListener("click", (event) => {
            if (event.target === dom.orderModal) {
                closeOrderModal();
            }
        });

        dom.deleteModal?.addEventListener("click", (event) => {
            if (event.target === dom.deleteModal) {
                closeDeleteModal();
            }
        });

        document.addEventListener("keydown", handleEscapeKey);

        dom.refreshDashboard?.addEventListener("click", refreshDashboard);
        dom.notificationButton?.addEventListener("click", () => {
            showToast(
                "Notificações",
                "Não há novas notificações pendentes neste momento.",
                "success"
            );
        });

        dom.orderNumber?.addEventListener("input", () => {
            dom.orderNumber.value = dom.orderNumber.value.toUpperCase();
            clearOrderNumberError();
        });

        dom.clientPhone?.addEventListener("input", applyPhoneMask);

        dom.orderStatus?.addEventListener("change", () => {
            if (dom.orderStatus.value === "concluida" && !dom.completionDate.value) {
                dom.completionDate.value = todayIso();
            }
        });
    }

    function loadData() {
        state.orders = readStorage(STORAGE_KEY, demoOrders);
        state.activities = readStorage(ACTIVITY_KEY, demoActivities);
    }

    function readStorage(key, fallback) {
        try {
            const stored = localStorage.getItem(key);

            if (!stored) {
                const initialValue = structuredCloneSafe(fallback);
                localStorage.setItem(key, JSON.stringify(initialValue));
                return initialValue;
            }

            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : structuredCloneSafe(fallback);
        } catch (error) {
            console.warn(`Não foi possível ler ${key}:`, error);
            return structuredCloneSafe(fallback);
        }
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.orders));
            localStorage.setItem(ACTIVITY_KEY, JSON.stringify(state.activities));
        } catch (error) {
            console.error("Não foi possível salvar os dados no navegador:", error);
            showToast(
                "Erro ao salvar",
                "O navegador não permitiu gravar os dados localmente.",
                "error"
            );
        }
    }

    function structuredCloneSafe(value) {
        if (typeof structuredClone === "function") {
            return structuredClone(value);
        }

        return JSON.parse(JSON.stringify(value));
    }

    function applyFilters() {
        const searchTerm = normalizeText(dom.searchOrder?.value || "");
        const status = dom.statusFilter?.value || "";
        const priority = dom.priorityFilter?.value || "";

        state.filteredOrders = [...state.orders]
            .filter((order) => {
                const searchableText = normalizeText(
                    [
                        order.numero,
                        order.cliente,
                        order.servico,
                        categoryLabels[order.categoria] || order.categoria,
                        order.equipamento,
                        order.tecnico
                    ]
                        .filter(Boolean)
                        .join(" ")
                );

                const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
                const matchesStatus = !status || order.status === status;
                const matchesPriority = !priority || order.prioridade === priority;

                return matchesSearch && matchesStatus && matchesPriority;
            })
            .sort(sortOrders);

        const totalPages = Math.max(1, Math.ceil(state.filteredOrders.length / PAGE_SIZE));
        state.currentPage = Math.min(state.currentPage, totalPages);

        renderOrders();
        updateStats();
        updatePagination();
    }

    function sortOrders(a, b) {
        const dateA = new Date(a.atualizadoEm || a.dataAbertura || 0).getTime();
        const dateB = new Date(b.atualizadoEm || b.dataAbertura || 0).getTime();
        return dateB - dateA;
    }

    function renderOrders() {
        if (!dom.ordersTableBody) {
            return;
        }

        if (state.filteredOrders.length === 0) {
            dom.ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                            <h4>Nenhuma ordem de serviço encontrada</h4>
                            <p>Altere os filtros ou cadastre uma nova ordem de serviço.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const start = (state.currentPage - 1) * PAGE_SIZE;
        const pageOrders = state.filteredOrders.slice(start, start + PAGE_SIZE);

        dom.ordersTableBody.innerHTML = pageOrders.map(createOrderRow).join("");
    }

    function createOrderRow(order) {
        const status = statusLabels[order.status] || "Não informado";
        const statusClass = statusClasses[order.status] || "status-rascunho";
        const priority = priorityLabels[order.prioridade] || "Normal";
        const priorityClass = priorityClasses[order.prioridade] || "badge-neutral";
        const clientType = clientTypeLabels[order.tipoCliente] || "Não informado";
        const category = categoryLabels[order.categoria] || "Não informada";

        return `
            <tr data-order-id="${escapeHtml(order.id)}">
                <td>
                    <span class="table-primary">${escapeHtml(order.numero)}</span>
                    <span class="table-secondary">${escapeHtml(getUpdateLabel(order))}</span>
                </td>
                <td>
                    <span class="table-primary">${escapeHtml(order.cliente)}</span>
                    <span class="table-secondary">${escapeHtml(clientType)}</span>
                </td>
                <td>
                    <span class="table-primary">${escapeHtml(order.servico)}</span>
                    <span class="table-secondary">${escapeHtml(category)}</span>
                </td>
                <td>${escapeHtml(formatDate(order.dataAbertura))}</td>
                <td>
                    <span class="badge ${statusClass}">${escapeHtml(status)}</span>
                </td>
                <td>
                    <span class="badge ${priorityClass}">${escapeHtml(priority)}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button
                            class="btn btn-icon btn-sm view-order"
                            type="button"
                            title="Visualizar"
                            aria-label="Visualizar ${escapeHtml(order.numero)}"
                        >
                            <i class="fa-solid fa-eye" aria-hidden="true"></i>
                        </button>

                        <button
                            class="btn btn-icon btn-sm edit-order"
                            type="button"
                            title="Editar"
                            aria-label="Editar ${escapeHtml(order.numero)}"
                        >
                            <i class="fa-solid fa-pen" aria-hidden="true"></i>
                        </button>

                        <button
                            class="btn btn-icon btn-sm danger delete-order"
                            type="button"
                            title="Excluir"
                            aria-label="Excluir ${escapeHtml(order.numero)}"
                        >
                            <i class="fa-solid fa-trash" aria-hidden="true"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    function updateStats() {
        const total = state.orders.length;
        const inProgress = state.orders.filter((order) => order.status === "andamento").length;
        const pending = state.orders.filter((order) => order.status === "pendente").length;
        const completed = state.orders.filter((order) => order.status === "concluida").length;

        setText(dom.totalOrders, total);
        setText(dom.ordersInProgress, inProgress);
        setText(dom.pendingOrders, pending);
        setText(dom.completedOrders, completed);
    }

    function updatePagination() {
        const total = state.filteredOrders.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const start = total === 0 ? 0 : (state.currentPage - 1) * PAGE_SIZE + 1;
        const end = Math.min(state.currentPage * PAGE_SIZE, total);

        if (dom.paginationInfo) {
            dom.paginationInfo.textContent = total === 0
                ? "Nenhum registro encontrado"
                : `Exibindo ${start}–${end} de ${total} registro${total === 1 ? "" : "s"}`;
        }

        if (dom.previousPage) {
            dom.previousPage.disabled = state.currentPage <= 1;
        }

        if (dom.nextPage) {
            dom.nextPage.disabled = state.currentPage >= totalPages;
        }

        if (dom.currentPageButton) {
            dom.currentPageButton.textContent = String(state.currentPage);
            dom.currentPageButton.setAttribute(
                "aria-label",
                `Página ${state.currentPage} de ${totalPages}`
            );
        }
    }

    function previousPage() {
        if (state.currentPage <= 1) {
            return;
        }

        state.currentPage -= 1;
        renderOrders();
        updatePagination();
        scrollToOrders();
    }

    function nextPage() {
        const totalPages = Math.ceil(state.filteredOrders.length / PAGE_SIZE);

        if (state.currentPage >= totalPages) {
            return;
        }

        state.currentPage += 1;
        renderOrders();
        updatePagination();
        scrollToOrders();
    }

    function scrollToOrders() {
        document.getElementById("ordens-servico")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function clearFilters() {
        if (dom.searchOrder) dom.searchOrder.value = "";
        if (dom.statusFilter) dom.statusFilter.value = "";
        if (dom.priorityFilter) dom.priorityFilter.value = "";

        state.currentPage = 1;
        applyFilters();
        showToast("Filtros limpos", "Todos os registros estão sendo exibidos.", "success");
    }

    function handleTableAction(event) {
        const button = event.target.closest("button");
        const row = event.target.closest("tr[data-order-id]");

        if (!button || !row) {
            return;
        }

        const orderId = row.dataset.orderId;

        if (button.classList.contains("view-order")) {
            openOrderModal("view", orderId);
        } else if (button.classList.contains("edit-order")) {
            openOrderModal("edit", orderId);
        } else if (button.classList.contains("delete-order")) {
            openDeleteModal(orderId);
        }
    }

    function openOrderModal(mode, orderId = null) {
        if (!dom.orderModal || !dom.orderForm) {
            return;
        }

        state.modalMode = mode;
        clearOrderNumberError();
        dom.orderForm.reset();

        if (mode === "create") {
            dom.orderModalTitle.textContent = "Nova ordem de serviço";
            dom.orderId.value = "";
            dom.orderNumber.value = generateOrderNumber();
            dom.openingDate.value = todayIso();
            dom.orderStatus.value = "pendente";
            dom.orderPriority.value = "normal";
            dom.visibleInPortal.checked = true;
            dom.technicianName.value = dom.technicianName.value || "Felipe Augusto";
            setFormReadOnly(false);
            setSaveButtonVisible(true);
            dom.cancelOrderModal.textContent = "Cancelar";
        } else {
            const order = state.orders.find((item) => item.id === orderId);

            if (!order) {
                showToast("Registro não encontrado", "Não foi possível abrir esta OS.", "error");
                return;
            }

            fillOrderForm(order);

            if (mode === "view") {
                dom.orderModalTitle.textContent = `Visualizar ${order.numero}`;
                setFormReadOnly(true);
                setSaveButtonVisible(false);
                dom.cancelOrderModal.textContent = "Fechar";
            } else {
                dom.orderModalTitle.textContent = `Editar ${order.numero}`;
                setFormReadOnly(false);
                setSaveButtonVisible(true);
                dom.cancelOrderModal.textContent = "Cancelar";
            }
        }

        showModal(dom.orderModal);
        window.setTimeout(() => {
            if (mode === "view") {
                dom.closeOrderModal?.focus();
            } else {
                dom.orderNumber?.focus();
            }
        }, 80);
    }

    function closeOrderModal() {
        hideModal(dom.orderModal);
        clearOrderNumberError();
        setFormReadOnly(false);
        setSaveButtonVisible(true);
        dom.orderForm?.reset();
    }

    function fillOrderForm(order) {
        dom.orderId.value = order.id || "";
        dom.orderNumber.value = order.numero || "";
        dom.openingDate.value = order.dataAbertura || "";
        dom.clientName.value = order.cliente || "";
        dom.clientType.value = order.tipoCliente || "residencial";
        dom.clientPhone.value = order.telefone || "";
        dom.clientEmail.value = order.email || "";
        dom.serviceAddress.value = order.endereco || "";
        dom.serviceCategory.value = order.categoria || "";
        dom.serviceTitle.value = order.servico || "";
        dom.orderStatus.value = order.status || "rascunho";
        dom.orderPriority.value = order.prioridade || "normal";
        dom.technicianName.value = order.tecnico || "";
        dom.equipmentName.value = order.equipamento || "";
        dom.equipmentModel.value = order.marcaModelo || "";
        dom.serialNumber.value = order.numeroSerie || "";
        dom.reportedProblem.value = order.problemaRelatado || "";
        dom.technicalDiagnosis.value = order.diagnostico || "";
        dom.performedService.value = order.servicoExecutado || "";
        dom.materialsUsed.value = order.materiais || "";
        dom.orderNotes.value = order.observacoes || "";
        dom.completionDate.value = order.dataConclusao || "";
        dom.nextMaintenance.value = order.proximaManutencao || "";
        dom.warrantyDate.value = order.garantiaAte || "";
        dom.visibleInPortal.checked = Boolean(order.visivelNoPortal);
    }

    function setFormReadOnly(readOnly) {
        dom.formFields.forEach((field) => {
            if (field.type === "hidden") {
                return;
            }

            field.disabled = readOnly;
        });
    }

    function setSaveButtonVisible(visible) {
        dom.saveOrderButton?.classList.toggle("hidden", !visible);
    }

    function saveOrder(event) {
        event.preventDefault();

        if (state.modalMode === "view") {
            return;
        }

        clearOrderNumberError();

        if (!dom.orderForm.checkValidity()) {
            dom.orderForm.reportValidity();
            return;
        }

        const formData = new FormData(dom.orderForm);
        const editingId = formData.get("orderId")?.toString() || "";
        const number = formData.get("numero")?.toString().trim().toUpperCase() || "";

        const duplicate = state.orders.some(
            (order) => order.numero.toUpperCase() === number && order.id !== editingId
        );

        if (duplicate) {
            showOrderNumberError("Já existe uma ordem de serviço com este número.");
            dom.orderNumber.focus();
            return;
        }

        const existingOrder = state.orders.find((order) => order.id === editingId);
        const now = new Date().toISOString();

        const order = {
            id: existingOrder?.id || createId(),
            numero: number,
            dataAbertura: getFormValue(formData, "dataAbertura"),
            cliente: getFormValue(formData, "cliente"),
            tipoCliente: getFormValue(formData, "tipoCliente", "residencial"),
            telefone: getFormValue(formData, "telefone"),
            email: getFormValue(formData, "email"),
            endereco: getFormValue(formData, "endereco"),
            categoria: getFormValue(formData, "categoria"),
            servico: getFormValue(formData, "servico"),
            status: getFormValue(formData, "status", "rascunho"),
            prioridade: getFormValue(formData, "prioridade", "normal"),
            tecnico: getFormValue(formData, "tecnico"),
            equipamento: getFormValue(formData, "equipamento"),
            marcaModelo: getFormValue(formData, "marcaModelo"),
            numeroSerie: getFormValue(formData, "numeroSerie"),
            problemaRelatado: getFormValue(formData, "problemaRelatado"),
            diagnostico: getFormValue(formData, "diagnostico"),
            servicoExecutado: getFormValue(formData, "servicoExecutado"),
            materiais: getFormValue(formData, "materiais"),
            observacoes: getFormValue(formData, "observacoes"),
            dataConclusao: getFormValue(formData, "dataConclusao"),
            proximaManutencao: getFormValue(formData, "proximaManutencao"),
            garantiaAte: getFormValue(formData, "garantiaAte"),
            visivelNoPortal: dom.visibleInPortal.checked,
            criadoEm: existingOrder?.criadoEm || now,
            atualizadoEm: now
        };

        if (order.status === "concluida" && !order.dataConclusao) {
            order.dataConclusao = todayIso();
        }

        if (existingOrder) {
            const index = state.orders.findIndex((item) => item.id === existingOrder.id);
            state.orders[index] = order;

            addActivity({
                type: order.status === "concluida" ? "complete" : "edit",
                title: order.status === "concluida" ? "Serviço concluído" : "Ordem de serviço atualizada",
                text: `${order.numero} foi atualizada no painel.`
            });

            showToast("OS atualizada", `${order.numero} foi salva com sucesso.`, "success");
        } else {
            state.orders.push(order);

            addActivity({
                type: "create",
                title: "Nova ordem de serviço cadastrada",
                text: `${order.numero} foi adicionada ao sistema.`
            });

            showToast("OS cadastrada", `${order.numero} foi criada com sucesso.`, "success");
        }

        saveData();
        state.currentPage = 1;
        closeOrderModal();
        applyFilters();
        renderActivities();
    }

    function getFormValue(formData, name, fallback = "") {
        return formData.get(name)?.toString().trim() || fallback;
    }

    function openDeleteModal(orderId) {
        const order = state.orders.find((item) => item.id === orderId);

        if (!order) {
            showToast("Registro não encontrado", "Não foi possível excluir esta OS.", "error");
            return;
        }

        state.selectedDeleteId = orderId;
        dom.deleteOrderNumber.textContent = order.numero;
        showModal(dom.deleteModal);
        window.setTimeout(() => dom.confirmDelete?.focus(), 80);
    }

    function closeDeleteModal() {
        hideModal(dom.deleteModal);
        state.selectedDeleteId = null;
    }

    function confirmDeleteOrder() {
        const order = state.orders.find((item) => item.id === state.selectedDeleteId);

        if (!order) {
            closeDeleteModal();
            return;
        }

        state.orders = state.orders.filter((item) => item.id !== state.selectedDeleteId);

        addActivity({
            type: "delete",
            title: "Ordem de serviço excluída",
            text: `${order.numero} foi removida do painel.`
        });

        saveData();
        closeDeleteModal();
        applyFilters();
        renderActivities();
        showToast("OS excluída", `${order.numero} foi removida.`, "warning");
    }

    function showModal(modal) {
        if (!modal) {
            return;
        }

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function hideModal(modal) {
        if (!modal) {
            return;
        }

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");

        const anotherModalIsOpen = document.querySelector(".modal-overlay.active");
        if (!anotherModalIsOpen) {
            document.body.style.overflow = "";
        }
    }

    function handleEscapeKey(event) {
        if (event.key !== "Escape") {
            return;
        }

        if (dom.deleteModal?.classList.contains("active")) {
            closeDeleteModal();
        } else if (dom.orderModal?.classList.contains("active")) {
            closeOrderModal();
        } else {
            closeSidebar();
        }
    }

    function generateOrderNumber() {
        const year = new Date().getFullYear();
        let highestSequence = 0;

        state.orders.forEach((order) => {
            const match = order.numero?.match(/^OS-(\d{4})-(\d+)$/i);

            if (match && Number(match[1]) === year) {
                highestSequence = Math.max(highestSequence, Number(match[2]));
            }
        });

        return `OS-${year}-${String(highestSequence + 1).padStart(4, "0")}`;
    }

    function showOrderNumberError(message) {
        if (!dom.orderNumberError || !dom.orderNumber) {
            return;
        }

        dom.orderNumberError.textContent = message;
        dom.orderNumberError.classList.remove("hidden");
        dom.orderNumber.setAttribute("aria-invalid", "true");
    }

    function clearOrderNumberError() {
        dom.orderNumberError?.classList.add("hidden");
        dom.orderNumber?.removeAttribute("aria-invalid");
    }

    function renderActivities() {
        if (!dom.activityList) {
            return;
        }

        const latestActivities = [...state.activities]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (latestActivities.length === 0) {
            dom.activityList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
                    <h4>Nenhuma atividade registrada</h4>
                    <p>As movimentações realizadas no painel aparecerão aqui.</p>
                </div>
            `;
            return;
        }

        dom.activityList.innerHTML = latestActivities
            .map((activity) => {
                const icon = activityIcons[activity.type] || "fa-circle-info";

                return `
                    <article class="activity-item">
                        <span class="activity-icon">
                            <i class="fa-solid ${icon}" aria-hidden="true"></i>
                        </span>

                        <div class="activity-content">
                            <strong>${escapeHtml(activity.title)}</strong>
                            <p>${escapeHtml(activity.text)}</p>
                            <span class="activity-time">${escapeHtml(formatDateTime(activity.date))}</span>
                        </div>
                    </article>
                `;
            })
            .join("");
    }

    function addActivity({ type, title, text }) {
        state.activities.unshift({
            id: createId(),
            type,
            title,
            text,
            date: new Date().toISOString()
        });

        state.activities = state.activities.slice(0, 30);
    }

    function exportOrdersToCsv() {
        if (state.filteredOrders.length === 0) {
            showToast("Nada para exportar", "Nenhuma OS corresponde aos filtros atuais.", "warning");
            return;
        }

        const headers = [
            "Número da OS",
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
            "Visível no portal"
        ];

        const rows = state.filteredOrders.map((order) => [
            order.numero,
            formatDate(order.dataAbertura),
            order.cliente,
            clientTypeLabels[order.tipoCliente] || order.tipoCliente,
            order.telefone,
            order.email,
            order.endereco,
            categoryLabels[order.categoria] || order.categoria,
            order.servico,
            statusLabels[order.status] || order.status,
            priorityLabels[order.prioridade] || order.prioridade,
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
            order.visivelNoPortal ? "Sim" : "Não"
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map(csvEscape).join(";"))
            .join("\r\n");

        const blob = new Blob(["\uFEFF", csv], {
            type: "text/csv;charset=utf-8;"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `ordens-de-servico-${todayIso()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        showToast(
            "Exportação concluída",
            `${state.filteredOrders.length} registro${state.filteredOrders.length === 1 ? " foi exportado" : "s foram exportados"}.`,
            "success"
        );
    }

    function csvEscape(value) {
        const text = String(value ?? "").replace(/"/g, '""');
        return `"${text}"`;
    }

    function refreshDashboard() {
        const icon = dom.refreshDashboard?.querySelector("i");
        icon?.classList.add("fa-spin");
        dom.refreshDashboard.disabled = true;

        window.setTimeout(() => {
            loadData();
            applyFilters();
            renderActivities();
            icon?.classList.remove("fa-spin");
            dom.refreshDashboard.disabled = false;

            showToast(
                "Painel atualizado",
                "Os dados armazenados no navegador foram recarregados.",
                "success"
            );
        }, 500);
    }

    function toggleSidebar() {
        const isOpen = dom.sidebar?.classList.toggle("active") || false;
        dom.sidebarOverlay?.classList.toggle("active", isOpen);
        dom.menuToggle?.setAttribute("aria-expanded", String(isOpen));
    }

    function closeSidebar() {
        dom.sidebar?.classList.remove("active");
        dom.sidebarOverlay?.classList.remove("active");
        dom.menuToggle?.setAttribute("aria-expanded", "false");
    }

    function handleMenuClick(event) {
        const item = event.currentTarget;
        const sectionName = item.dataset.section;
        const section = sectionName ? document.getElementById(sectionName) : null;

        dom.menuItems.forEach((menuItem) => menuItem.classList.remove("active"));
        item.classList.add("active");
        closeSidebar();

        if (!section) {
            event.preventDefault();
            showToast(
                "Módulo em desenvolvimento",
                "Esta área será criada nas próximas etapas do painel.",
                "warning"
            );
            return;
        }

        event.preventDefault();
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${sectionName}`);
    }

    function showToast(title, message, type = "success") {
        if (!dom.toastContainer) {
            return;
        }

        const toast = document.createElement("div");
        const icons = {
            success: "fa-circle-check",
            warning: "fa-triangle-exclamation",
            error: "fa-circle-xmark"
        };

        toast.className = `toast ${type}`;
        toast.setAttribute("role", "status");
        toast.innerHTML = `
            <span class="toast-icon">
                <i class="fa-solid ${icons[type] || "fa-circle-info"}" aria-hidden="true"></i>
            </span>

            <div class="toast-content">
                <strong>${escapeHtml(title)}</strong>
                <p>${escapeHtml(message)}</p>
            </div>

            <button class="toast-close" type="button" aria-label="Fechar notificação">
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
        `;

        const closeButton = toast.querySelector(".toast-close");
        closeButton?.addEventListener("click", () => removeToast(toast));

        dom.toastContainer.appendChild(toast);
        window.setTimeout(() => removeToast(toast), 5000);
    }

    function removeToast(toast) {
        if (!toast?.isConnected) {
            return;
        }

        toast.style.opacity = "0";
        toast.style.transform = "translateY(-8px)";

        window.setTimeout(() => toast.remove(), 220);
    }

    function applyPhoneMask(event) {
        const input = event.currentTarget;
        let value = input.value.replace(/\D/g, "").slice(0, 11);

        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d+)/, "($1) $2");
        } else if (value.length > 0) {
            value = value.replace(/^(\d*)/, "($1");
        }

        input.value = value;
    }

    function updateCurrentDate() {
        if (!dom.currentDate) {
            return;
        }

        dom.currentDate.textContent = new Intl.DateTimeFormat("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(new Date());
    }

    function getUpdateLabel(order) {
        if (order.status === "concluida") {
            return "Finalizada";
        }

        const date = new Date(order.atualizadoEm || order.dataAbertura);
        const today = startOfDay(new Date());
        const updatedDay = startOfDay(date);
        const difference = Math.round((today - updatedDay) / 86400000);

        if (difference === 0) return "Atualizada hoje";
        if (difference === 1) return "Atualizada ontem";
        return `Atualizada em ${formatDate(order.atualizadoEm || order.dataAbertura)}`;
    }

    function formatDate(value) {
        if (!value) {
            return "—";
        }

        const date = parseLocalDate(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return new Intl.DateTimeFormat("pt-BR").format(date);
    }

    function formatDateTime(value) {
        if (!value) {
            return "Data não informada";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        const today = startOfDay(new Date());
        const activityDay = startOfDay(date);
        const difference = Math.round((today - activityDay) / 86400000);
        const time = new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);

        if (difference === 0) return `Hoje, às ${time}`;
        if (difference === 1) return `Ontem, às ${time}`;

        return `${new Intl.DateTimeFormat("pt-BR").format(date)}, às ${time}`;
    }

    function parseLocalDate(value) {
        const text = String(value);
        const datePart = text.slice(0, 10);
        const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (match) {
            return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        }

        return new Date(value);
    }

    function startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function todayIso() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function normalizeText(value) {
        return String(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setText(element, value) {
        if (element) {
            element.textContent = String(value);
        }
    }

    function createId() {
        if (window.crypto?.randomUUID) {
            return window.crypto.randomUUID();
        }

        return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
})();
