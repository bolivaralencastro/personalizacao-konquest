// ==== START: SIDEBAR MENU COMPONENT JAVASCRIPT ====
function initializeCustomSidebarMenu(containerId = 'myCustomSidebarMenu') {
    const menuContainer = document.getElementById(containerId); if (!menuContainer) { console.warn(`Sidebar container '${containerId}' not found.`); return; }
    const adminToggle = menuContainer.querySelector('#cs-admin-toggle'); const adminSubmenuPanel = menuContainer.querySelector('#cs-admin-submenu-panel');
    if (adminToggle && adminSubmenuPanel) {
        adminToggle.addEventListener('click', function (event) { event.preventDefault(); const isCurrentlyOpen = adminSubmenuPanel.classList.contains('cs-open'); if (isCurrentlyOpen) { adminSubmenuPanel.classList.remove('cs-open'); adminToggle.setAttribute('aria-expanded', 'false'); adminSubmenuPanel.setAttribute('aria-hidden', 'true'); adminToggle.classList.remove('cs-active'); } else { adminSubmenuPanel.classList.add('cs-open'); adminToggle.setAttribute('aria-expanded', 'true'); adminSubmenuPanel.setAttribute('aria-hidden', 'false'); adminToggle.classList.add('cs-active'); } });
    }
    document.addEventListener('click', function(event) { if (menuContainer && adminSubmenuPanel && adminSubmenuPanel.classList.contains('cs-open')) { if (adminToggle && !adminToggle.contains(event.target) && !adminSubmenuPanel.contains(event.target)) { adminSubmenuPanel.classList.remove('cs-open'); adminToggle.setAttribute('aria-expanded', 'false'); adminToggle.classList.remove('cs-active'); adminSubmenuPanel.setAttribute('aria-hidden', 'true'); } } });
}
// ==== END: SIDEBAR MENU COMPONENT JAVASCRIPT ====

// ==== START: TOP NAVIGATION BAR COMPONENT JAVASCRIPT ====
function initializeCustomTopBar(containerId = 'myCustomTopBar') {
    const topBarContainer = document.getElementById(containerId); if (!topBarContainer) { console.warn(`TopBar container '${containerId}' not found.`); return; }
    const menuToggle = topBarContainer.querySelector('.ctb-menu-toggle');
    // Link top bar menu toggle to sidebar's admin toggle for this specific page setup
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const adminToggleSidebar = document.getElementById('cs-admin-toggle');
            if (adminToggleSidebar) {
                adminToggleSidebar.click(); // Simulate a click on the sidebar's admin toggle
            } else {
                console.log('Sidebar Admin Toggle not found for TopBar Menu action.');
            }
        });
    }
    const searchInput = topBarContainer.querySelector('.ctb-search-input');
    if (searchInput) searchInput.addEventListener('keypress', (event) => { if (event.key === 'Enter' && searchInput.value.trim() !== '') console.log('Search submitted:', searchInput.value); });
    const userProfile = topBarContainer.querySelector('.ctb-user-profile');
    if (userProfile) { userProfile.addEventListener('click', () => console.log('User profile clicked!')); userProfile.addEventListener('keypress', (event) => { if (event.key === 'Enter' || event.key === ' ') console.log('User profile activated!'); }); }
    const actionButtons = topBarContainer.querySelectorAll('.ctb-action-icons .ctb-icon-button');
    actionButtons.forEach(button => button.addEventListener('click', () => console.log(`${button.getAttribute('aria-label')} icon clicked.`)));
}
// ==== END: TOP NAVIGATION BAR COMPONENT JAVASCRIPT ====

// ==== START: SESSÕES PERSONALIZADAS PAGE SCRIPT ====
const SessaoPersonalizadaApp = (function() {
    let sessions = []; 
    let currentModuleId = 'destaques';
    let editingContentSessionId = null; 
    let schedulingSessionId = null; // Replaced sessionToScheduleViaPopoverId
    let deletingSessionId = null; // Replaced sessionToDeleteId
    let draggedSessionElement = null; 
    let draggedContentTagElement = null;
    let draggedContentParentSessionId = null;

    const DEFAULT_TITLE = "Adicione o titulo";
    const DEFAULT_DESCRIPTION = "Adicione a descrição";
    const LOCAL_STORAGE_KEY = 'adminSessions_App_Refactored_v2'; // Updated key

    const MOCK_COURSES = [ { id: 'c1', name: 'Introdução à Programação Web', categoryIds: ['cat1'] }, { id: 'c2', name: 'Design UI/UX para Iniciantes', categoryIds: ['cat2'] }, { id: 'c3', name: 'Gestão Ágil de Projetos com Scrum', categoryIds: ['cat3'] }, { id: 'c4', name: 'Marketing Digital Essencial', categoryIds: ['cat3', 'cat4'] }, { id: 'c5', name: 'Desenvolvimento Pessoal e Profissional', categoryIds: ['cat4'] } ];
    const MOCK_TRAILS = [ { id: 't1', name: 'Trilha Desenvolvedor Front-End Completo' }, { id: 't2', name: 'Trilha Especialista em UX Design' }, { id: 't3', name: 'Trilha Liderança e Gestão de Equipes' }, { id: 't4', name: 'Tecnologias Emergentes e Futuro do Trabalho'} ];
    const MOCK_CATEGORIES = [ { id: 'cat1', name: 'Tecnologia' }, { id: 'cat2', name: 'Design' }, { id: 'cat3', name: 'Negócios' }, { id: 'cat4', name: 'Desenvolvimento Pessoal'} ];
    
    const DOM = {
        moduleTabs: document.querySelectorAll('.module-tab'),
        sessionsListContainer: document.getElementById('sessions-list-container'),
        emptyStateSessions: document.getElementById('empty-state-sessions'),
        emptyStateTextParagraph: document.querySelector('#empty-state-sessions p'),
        emptyStateTitleHeading: document.querySelector('#empty-state-sessions h2'),
        createSessionDropdownBtn: document.getElementById('page-create-session-dropdown-btn'),
        createSessionOptionsContainer: document.getElementById('create-session-options'),
        saveAllBtn: document.getElementById('page-save-all-btn'),
        schedulePopover: document.getElementById('schedule-popover'),
        schedulePopoverSessionIdInput: document.getElementById('schedule-popover-session-id'), // This can be removed if schedulingSessionId is used directly
        popoverStartDateInput: document.getElementById('popover-start-date'),
        popoverEndDateInput: document.getElementById('popover-end-date'),
        schedulePopoverSaveBtn: document.getElementById('schedule-popover-save'),
        schedulePopoverCancelBtn: document.getElementById('schedule-popover-cancel'),
        schedulePopoverClearBtn: document.getElementById('schedule-popover-clear'),
        contentSelectionPopover: document.getElementById('content-selection-popover'),
        contentSearchIndividual: document.getElementById('content-popover-search-individual'),
        contentListIndividual: document.getElementById('content-popover-list-individual'),
        contentSearchCategory: document.getElementById('content-popover-search-category'),
        contentListCategory: document.getElementById('content-popover-list-category'),
        contentConfirmBtn: document.getElementById('content-popover-confirm'),
        contentCancelBtn: document.getElementById('content-popover-cancel'),
        popoverTabBtns: document.querySelectorAll('#content-selection-popover .popover-tab-btn'),
        popoverTabContents: document.querySelectorAll('#content-selection-popover .popover-tab-content'),
        confirmDeleteModal: document.getElementById('confirm-delete-modal'),
        sessionToDeleteNameEl: document.getElementById('session-to-delete-name'),
        confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
        toastContainer: document.getElementById('toast-container'),
        emptyStateCreateSessionDropdownBtn: document.getElementById('empty-state-create-session-dropdown-btn'),
        emptyStateCreateSessionOptionsContainer: document.getElementById('empty-state-create-session-options')
    };

    // Populate create session options for both buttons initially
    updateAllCreateSessionOptions();

    function showToast(message, type = 'success') { const t=document.createElement('div'); t.className=`toast ${type}`; let iN='check_circle'; if(type==='error')iN='error'; else if(type==='info')iN='info'; t.innerHTML=`<span class="material-icons">${iN}</span> ${message}`; DOM.toastContainer.appendChild(t); setTimeout(()=>t.classList.add('show'),10); setTimeout(()=>{t.classList.remove('show'); setTimeout(()=>t.remove(),300);},3000); }
    // Função para abrir um modal
    function openModal(modalId) { const m=document.getElementById(modalId); if(m)m.style.display='flex'; } // Use flex para centralizar
    function closeModal(modalId) { const m=document.getElementById(modalId); if(m)m.style.display='none'; }
    function formatDate(dateStr) { if(!dateStr)return 'N/A'; const [y,m,d]=dateStr.split('-'); return `${d}/${m}/${y}`; }
    function getItemById(itemId, typeCtx) { if(typeCtx==='manual_course')return MOCK_COURSES.find(c=>c.id===itemId); if(typeCtx==='manual_trail')return MOCK_TRAILS.find(t=>t.id===itemId); return null; }
    function getSessionTypeIconName(type) { if(type==='manual_trail')return 'conversion_path'; if(type==='manual_course')return 'rocket_launch'; if(type==='enrollment')return 'school'; if(type==='event')return 'calendar_month'; if(type==='all_content')return 'select_all'; return 'widgets'; }
    function getSessionTypeName(type) { if(type==='manual_trail')return 'Trilha'; if(type==='manual_course')return 'Curso'; if(type==='enrollment')return 'Matrícula'; if(type==='event')return 'Evento'; if(type==='all_content')return 'Todos'; return 'Sessão'; }

    function renderSessions() { DOM.sessionsListContainer.innerHTML = ''; const today = new Date().toISOString().split('T')[0]; const moduleSessions = sessions.filter(s => s.moduleId === currentModuleId).sort((a, b) => (a.order !== undefined && b.order !== undefined) ? a.order - b.order : new Date(b.creationDate) - new Date(a.creationDate)); if (moduleSessions.length === 0) {
        DOM.emptyStateSessions.style.display = 'block';
        DOM.sessionsListContainer.style.display = 'none';
        
        let titleText = '';
        let paragraphText = '';

        if (currentModuleId === 'destaques') {
            titleText = 'Suas sessões de Destaques aparecerão aqui.';
            paragraphText = 'Agrupe conteúdos em sessões para facilitar o acesso e a navegação.<br><br>Comece criando uma sessão de destaques.';
        } else if (currentModuleId === 'trilhas') {
            titleText = 'Suas sessões de Trilhas aparecerão aqui.';
            paragraphText = 'Organize trilhas em sessões para deixar tudo mais acessível.<br><br>Comece criando uma sessão de trilhas.';
        } else if (currentModuleId === 'cursos') {
            titleText = 'Suas sessões de Cursos aparecerão aqui.';
            paragraphText = 'Agrupe cursos por sessões para facilitar a navegação dos alunos.<br><br>Comece criando uma sessão de cursos.';
        } else if (currentModuleId === 'eventos') {
            titleText = 'Suas sessões de Eventos aparecerão aqui.';
            paragraphText = 'Centralize seus eventos em sessões para manter tudo organizado.<br><br>Comece criando uma sessão de eventos.';
        }
        
        if (DOM.emptyStateTitleHeading) {
             DOM.emptyStateTitleHeading.textContent = titleText;
        }

        if (DOM.emptyStateTextParagraph) {
             DOM.emptyStateTextParagraph.innerHTML = paragraphText;
        }

    } else { DOM.emptyStateSessions.style.display = 'none'; DOM.sessionsListContainer.style.display = 'block'; moduleSessions.forEach((session) => { const card = document.createElement('div'); card.className = 'session-card'; card.dataset.sessionId = session.id;
            let statusText = session.isScheduled ? `<span class="material-icons-outlined">event_available</span> Programado: ${formatDate(session.startDate)} - ${formatDate(session.endDate)}` : '<span class="material-icons-outlined">event_busy</span> Sem programação';
            if (session.isScheduled && session.endDate < today) { statusText += ' (Expirada)'; card.style.opacity = "0.7"; }

            let contentTagsHtml = '';
            let enrollmentDescription = '';
            if (session.type === 'enrollment') {
                if (session.moduleId === 'destaques') {
                    // Determinar o ícone e texto baseado no filtro atual
                    const filterType = session.enrollmentTypeFilter || 'all'; // Pega o filtro salvo ou 'all' como padrão para lógica de ícone/texto
                    let chipIconName = 'school'; // Ícone padrão para matrícula
                    let chipText = 'Trilhas, Cursos e Eventos'; // Texto padrão para 'all'

                    if (filterType === 'trail') { chipIconName = 'conversion_path'; chipText = 'Trilhas'; }
                    else if (filterType === 'course') { chipIconName = 'rocket_launch'; chipText = 'Cursos'; }
                    else if (filterType === 'event') { chipIconName = 'calendar_month'; chipText = 'Eventos'; }
                    // Se o filtro for nulo (estado inicial), exibir 'selecione'
                    else if (session.enrollmentTypeFilter === null) { chipText = 'selecione'; }

                    const chipIconClass = (chipIconName === 'school' || chipIconName === 'widgets') ? 'material-icons-outlined' : 'material-symbols-outlined';

                    // Gerar HTML para o chip customizado
                    enrollmentDescription = `Exibe automaticamente matrículas de 
                        <span class="enrollment-type-filter-chip" data-session-id="${session.id}" tabindex="0" role="button">
                            <span class="${chipIconClass}">${chipIconName}</span>
                            ${chipText}
                            <span class="material-icons-outlined dropdown-arrow">expand_more</span>
                        </span>
                    `;
                } else if (session.moduleId === 'trilhas') {
                    enrollmentDescription = 'Exibe automaticamente matrículas em trilhas.';
                } else if (session.moduleId === 'cursos') {
                     enrollmentDescription = 'Exibe automaticamente matrículas em cursos.';
                } else if (session.moduleId === 'eventos') {
                     enrollmentDescription = 'Exibe automaticamente matrículas em eventos.';
                }
                contentTagsHtml = `<p>${enrollmentDescription}</p>`;
            } else if (session.type === 'all_content') {
                 let allContentDescription = '';
                 if (session.moduleId === 'trilhas') {
                     allContentDescription = 'Essa sessão Exibe automaticamente todas as trilhas cadastradas.';
                 } else if (session.moduleId === 'cursos') {
                      allContentDescription = 'Essa sessão Exibe automaticamente todos os cursos cadastrados.';
                 } else if (session.moduleId === 'eventos') {
                      allContentDescription = 'Essa sessão Exibe automaticamente todos os eventos cadastrados.';
                 }
                 contentTagsHtml = `<p>${allContentDescription}</p>`;
             } else if (session.type === 'manual_trail' || session.type === 'manual_course') {
                session.content.forEach(itemId => {
                    const item = getItemById(itemId, session.type);
                    const itemIconName = (session.type === 'manual_trail') ? 'conversion_path' : ((session.type === 'manual_course') ? 'rocket_launch' : 'widgets');
                    const itemIconClass = (itemIconName === 'school' || itemIconName === 'widgets') ? 'material-icons-outlined' : 'material-symbols-outlined';

                    contentTagsHtml += `<span class="content-tag" draggable="true" data-item-id="${itemId}">
                                            <span class="${itemIconClass}">${itemIconName}</span>
                                            ${item ? item.name : 'ID: ' + itemId}
                                            <button class="remove-tag-btn" data-item-id="${itemId}" data-session-id="${session.id}"><span class="material-icons-outlined">close</span></button>
                                        </span>`;
                });

                // NOVO: Renderizar chips para categorias em sessões de curso E TRILHA
                if ((session.type === 'manual_course' || session.type === 'manual_trail') && session.contentCategoryIds && session.contentCategoryIds.length > 0) {
                     session.contentCategoryIds.forEach(catId => {
                         const category = MOCK_CATEGORIES.find(c => c.id === catId);
                         if (category) {
                             let count = 0;
                             // Contar itens nesta categoria baseado no tipo de sessão
                             if (session.type === 'manual_course') {
                                  count = MOCK_COURSES.filter(course => course.categoryIds && course.categoryIds.includes(catId)).length;
                             } else if (session.type === 'manual_trail') {
                                  // Contar trilhas nesta categoria (se MOCK_TRAILS tivesse categoryIds)
                                  // Como não tem, a contagem será 0 com os dados atuais.
                                  // count = MOCK_TRAILS.filter(trail => trail.categoryIds && trail.categoryIds.includes(catId)).length;
                                  // Para demonstração, vamos apenas contar quantos itens *individuais*
                                  // da categoria foram adicionados, se essa funcionalidade for implementada.
                                  // Ou, se a categoria representa "Todas as trilhas", podemos indicar isso de outra forma.
                                  // Por agora, vamos apenas exibir o nome da categoria sem contagem para trilhas,
                                  // a menos que a estrutura de dados de trilhas seja atualizada.
                                  // Ou, para exibir algo, podemos contar os cursos NESSA categoria,
                                  // assumindo que uma categoria de trilha pode conter cursos relevantes.
                                  // Vamos manter a contagem de cursos por enquanto, para ter um número,
                                  // mas idealmente isso contaria trilhas se a estrutura de dados permitisse.
                                   count = MOCK_COURSES.filter(course => course.categoryIds && course.categoryIds.includes(catId)).length; // Contando cursos para fins de demonstração
                             }

                             const categoryIconName = 'folder'; // Ícone de pasta para categoria
                             const categoryIconClass = 'material-icons-outlined'; // Classe para ícone de categoria

                             contentTagsHtml += `<span class="content-tag category-tag" data-category-id="${catId}" data-session-id="${session.id}">
                                                     <span class="${categoryIconClass}">${categoryIconName}</span>
                                                     ${category.name} (${count})
                                                     <button class="remove-tag-btn" data-category-id="${catId}" data-session-id="${session.id}"><span class="material-icons-outlined">close</span></button>
                                                 </span>`;
                         }
                     });
                 }
            }

            let addContentButtonHtml = (session.type === 'manual_trail' || session.type === 'manual_course') ? `<button class="add-content-btn" data-session-id="${session.id}"><span class="material-icons-outlined">add</span> Adicionar conteúdo</button>` : '';

            // Ajustar a lógica para incluir all_content e enrollment usando contentTagsHtml
            let contentAreaHtml = '';
            if (session.type === 'manual_trail' || session.type === 'manual_course') {
                contentAreaHtml = `<div class="content-tags-container" data-session-id="${session.id}">${contentTagsHtml}${addContentButtonHtml}</div>`;
            } else if (session.type === 'enrollment' || session.type === 'all_content') {
                contentAreaHtml = contentTagsHtml;
            }

            const sessionTypeIcon = getSessionTypeIconName(session.type);
            const sessionTypeIconClass = (sessionTypeIcon === 'school' || sessionTypeIcon === 'widgets') ? 'material-icons-outlined' : 'material-symbols-outlined';

            card.innerHTML = `
                <div class="session-card-header">
                    <div class="session-card-title-section">
                        <span class="${sessionTypeIconClass} type-icon">${sessionTypeIcon}</span>
                        <div class="text-content">
                            <h3 class="editable-text" data-field="title" tabindex="0">${session.title}</h3>
                            <p class="session-card-description editable-text" data-field="description" tabindex="0">${session.description}</p>
                        </div>
                    </div>
                    <p class="session-card-status" data-action="open-schedule-popover" tabindex="0">${statusText}</p>
                    <div class="session-card-actions">
                        <!-- Estrutura de Icon Button Material Design para Excluir -->
                        <button class="delete-session-btn" title="Excluir">
                            <div class="icon-button-container-48">
                                <div class="icon-button-container-40">
                                    <div class="icon-container-24">
                                        <span class="material-icons-outlined">delete_outline</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                        <!-- NEW START: Botões Mover Cima/Baixo -->
                        <button class="move-up-btn" title="Mover para cima">
                            <div class="icon-button-container-48">
                                <div class="icon-button-container-40">
                                    <div class="icon-container-24">
                                        <span class="material-icons-outlined">arrow_upward</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                        <button class="move-down-btn" title="Mover para baixo">
                            <div class="icon-button-container-48">
                                <div class="icon-button-container-40">
                                    <div class="icon-container-24">
                                        <span class="material-icons-outlined">arrow_downward</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                        <!-- NEW END: Botões Mover Cima/Baixo -->
                    </div>
                </div>
                <div class="session-content-area">
                    ${contentAreaHtml}
                </div>
            `;

            // Se for sessão de matrícula em destaques, configurar o chip e popover
            if (session.type === 'enrollment' && session.moduleId === 'destaques') {
                const chip = card.querySelector('.enrollment-type-filter-chip');
                if (chip) {
                    chip.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openEnrollmentTypeSelectPopover(session.id, chip);
                    });
                }
            }

            DOM.sessionsListContainer.appendChild(card);
        }); } }
    function updateCreateSessionOptions(){DOM.createSessionOptionsContainer.innerHTML='';let opts=[];if(currentModuleId==='destaques')opts=[{type:'manual_trail',name:'Trilha',icon:'conversion_path'},{type:'manual_course',name:'Curso',icon:'rocket_launch'},{type:'enrollment',name:'Matrículas',icon:'school'}];else if(currentModuleId==='trilhas')opts=[{type:'manual_trail',name:'Trilha',icon:'conversion_path'},{type:'enrollment',name:'Matrículas',icon:'school'}];else if(currentModuleId==='cursos')opts=[{type:'manual_course',name:'Curso',icon:'rocket_launch'},{type:'enrollment',name:'Matrículas',icon:'school'}];opts.forEach(opt=>{const btn=document.createElement('button');btn.dataset.sessionType=opt.type;let iconCls=(opt.icon==='school'||opt.icon==='widgets')?'material-icons-outlined':'material-symbols-outlined';btn.innerHTML=`<span class="${iconCls}">${opt.icon}</span> ${opt.name}`;btn.addEventListener('click',()=>{createNewSession(opt.type);DOM.createSessionOptionsContainer.style.display='none';});DOM.createSessionOptionsContainer.appendChild(btn);});}
    function updateAllCreateSessionOptions() {
        let opts = [];
        if (currentModuleId === 'destaques') {
            opts = [
                { type: 'manual_trail', name: 'Trilha', icon: 'conversion_path' },
                { type: 'manual_course', name: 'Curso', icon: 'rocket_launch' },
                { type: 'event', name: 'Evento', icon: 'calendar_month' },
                { type: 'enrollment', name: 'Matrículas', icon: 'school' }
            ];
        } else if (currentModuleId === 'trilhas') {
            opts = [
                { type: 'manual_trail', name: 'Trilha', icon: 'conversion_path' },
                { type: 'enrollment', name: 'Matrículas', icon: 'school' },
                { type: 'all_content', name: 'Todos', icon: 'select_all' }
            ];
        } else if (currentModuleId === 'cursos') {
            opts = [
                { type: 'manual_course', name: 'Curso', icon: 'rocket_launch' },
                { type: 'enrollment', name: 'Matrículas', icon: 'school' },
                { type: 'all_content', name: 'Todos', icon: 'select_all' }
            ];
        } else if (currentModuleId === 'eventos') {
            opts = [
                { type: 'event', name: 'Evento', icon: 'calendar_month' },
                { type: 'enrollment', name: 'Matrículas', icon: 'school' },
                { type: 'all_content', name: 'Todos', icon: 'select_all' }
            ];
        }

        // Clear existing options
        DOM.createSessionOptionsContainer.innerHTML = '';
        DOM.emptyStateCreateSessionOptionsContainer.innerHTML = '';

        // Populate both dropdowns
        opts.forEach(opt => {
            const btnPage = document.createElement('button');
            btnPage.dataset.sessionType = opt.type;
            let iconCls = (opt.icon === 'school' || opt.icon === 'widgets') ? 'material-icons-outlined' : 'material-symbols-outlined';
            btnPage.innerHTML = `<span class="${iconCls}">${opt.icon}</span> ${opt.name}`;
            btnPage.addEventListener('click', () => { createNewSession(opt.type); DOM.createSessionOptionsContainer.style.display = 'none'; });
            btnPage.classList.add('dropdown-item');
            DOM.createSessionOptionsContainer.appendChild(btnPage);

            const btnEmpty = document.createElement('button');
            btnEmpty.dataset.sessionType = opt.type;
            btnEmpty.innerHTML = `<span class="${iconCls}">${opt.icon}</span> ${opt.name}`;
            btnEmpty.addEventListener('click', () => { createNewSession(opt.type); DOM.emptyStateCreateSessionOptionsContainer.style.display = 'none'; });
            btnEmpty.classList.add('dropdown-item');
            DOM.emptyStateCreateSessionOptionsContainer.appendChild(btnEmpty);
        });
    }
    function createNewSession(sessType){const newSess={'id':'sess_'+Date.now(),moduleId:currentModuleId,type:sessType,title:DEFAULT_TITLE,description:DEFAULT_DESCRIPTION,startDate:null,endDate:null,content:[],order:sessions.length,creationDate:new Date().toISOString(),isScheduled:false};
    
    // Definir título e descrição padrão para sessões do tipo 'Todos'
    if (sessType === 'all_content') {
        if (currentModuleId === 'trilhas') {
            newSess.title = 'Todas as Trilhas';
            newSess.description = 'Confira todas as trilhas disponíveis.';
        } else if (currentModuleId === 'cursos') {
            newSess.title = 'Todos os Cursos';
            newSess.description = 'Confira todos os cursos disponíveis.';
        } else if (currentModuleId === 'eventos') {
            newSess.title = 'Todos os Eventos';
            newSess.description = 'Confira todos os eventos disponíveis.';
        }
    }

    // Adicionar campo enrollmentTypeFilter para sessões de matrícula em destaques e inicializar como null.
    if (sessType === 'enrollment' && currentModuleId === 'destaques') {
        newSess.enrollmentTypeFilter = null; // Inicializar como null para mostrar 'selecione'
    }

    sessions.push(newSess);showToast(`Sessão de ${getSessionTypeName(sessType).toLowerCase()} criada!`);renderSessions();}
    function handleInlineEditFocusIn(e){if(e.target.classList.contains('editable-text'))e.target.setAttribute('contenteditable','true');}
    function handleInlineEditFocusOut(e){if(e.target.classList.contains('editable-text')){e.target.removeAttribute('contenteditable');const sessId=e.target.closest('.session-card').dataset.sessionId;const field=e.target.dataset.field;const newVal=e.target.textContent.trim();const sess=sessions.find(s=>s.id===sessId);if(sess){const origVal=sess[field];let finalVal=newVal===''? (field==='title'?DEFAULT_TITLE:DEFAULT_DESCRIPTION):newVal;if(origVal!==finalVal){sess[field]=finalVal;showToast(`${field==='title'?'Título':'Descrição'} atualizado(a).`);}e.target.textContent=finalVal;}}}
    function handleInlineEditKeyDown(e){if(e.target.classList.contains('editable-text')&&e.key==='Enter'){e.preventDefault();e.target.blur();}}
    function openSchedulePopover(sessionId, triggerElement) {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        schedulingSessionId = sessionId;
        DOM.schedulePopoverSessionIdInput.value = sessionId;
        DOM.popoverStartDateInput.value = session.startDate || '';
        DOM.popoverEndDateInput.value = session.endDate || '';

        const popover = DOM.schedulePopover;
        const rect = triggerElement.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        // Obter o valor do token de espaçamento --spacing-xs (8px)
        const style = getComputedStyle(document.documentElement);
        const edgeMargin = parseInt(style.getPropertyValue('--spacing-xs').replace('px', ''), 10);

        // Posicionar o dropdown abaixo do elemento que o acionou
        const topPos = rect.bottom + window.scrollY + parseInt(style.getPropertyValue('--spacing-xxs').replace('px', ''), 10);
        popover.style.top = `${topPos}px`;

        // Mostrar temporariamente para medir a largura antes de posicionar horizontalmente
         popover.style.visibility = 'hidden';
         popover.style.display = 'block';

        const popoverWidth = popover.offsetWidth;

        let leftPos = rect.left + window.scrollX;

        // Verificar se o dropdown ultrapassa a borda direita da janela
        if (leftPos + popoverWidth > windowWidth - edgeMargin) {
            // Se ultrapassar, calcular left para que a borda direita do popover fique na borda direita da janela - margem
            leftPos = windowWidth - edgeMargin - popoverWidth;
        }

        // Garantir que o dropdown não fique muito para a esquerda, respeitando a margem
        leftPos = Math.max(edgeMargin, leftPos);

        popover.style.left = `${leftPos}px`;

        // Tornar visível após posicionar
        popover.style.visibility = 'visible';
    }
    function closeSchedulePopover() {
        DOM.schedulePopover.style.display = 'none';
        schedulingSessionId = null;
        
        // Remover classe de edição de todos os elementos
        document.querySelectorAll('.session-card-status.editing').forEach(el => {
            el.classList.remove('editing');
        });
    }
    function saveSchedule() {
        if (!schedulingSessionId) return;

        const session = sessions.find(s => s.id === schedulingSessionId);
        if (!session) return;

        const startDate = DOM.popoverStartDateInput.value;
        const endDate = DOM.popoverEndDateInput.value;

        session.startDate = startDate;
        session.endDate = endDate;
        session.isScheduled = startDate || endDate;

        renderSessions();
        closeSchedulePopover();
        showToast('Programação atualizada!');
    }
    function clearSchedule() {
        if (!schedulingSessionId) return;

        const session = sessions.find(s => s.id === schedulingSessionId);
        if (!session) return;

        session.startDate = null;
        session.endDate = null;
        session.isScheduled = false;

        DOM.popoverStartDateInput.value = '';
        DOM.popoverEndDateInput.value = '';

        renderSessions();
        showToast('Programação removida!');
    }
    function closeContentPopover(){if(DOM.contentSelectionPopover)DOM.contentSelectionPopover.style.display='none'; editingContentSessionId = null;}
    function handleContentPopoverTabClick(event){DOM.popoverTabBtns.forEach(b=>b.classList.remove('active'));event.currentTarget.classList.add('active');DOM.popoverTabContents.forEach(c=>c.classList.remove('active'));document.getElementById(`popover-${event.currentTarget.dataset.tab}-content`).classList.add('active');if(event.currentTarget.dataset.tab==='category'&&DOM.contentListCategory.innerHTML.trim()==='')populateCategoriesForContentPopover();}
    function populateContentPopover(sessId,btnEl){const sess=sessions.find(s=>s.id===sessId);if(!sess||(sess.type!=='manual_course'&&sess.type!=='manual_trail')){closeContentPopover();return;}editingContentSessionId=sessId;DOM.popoverTabBtns.forEach(b=>b.classList.remove('active'));DOM.popoverTabContents.forEach(c=>c.classList.remove('active'));DOM.popoverTabBtns[0].classList.add('active');DOM.popoverTabContents[0].classList.add('active');const catTabBtn=DOM.contentSelectionPopover.querySelector('button[data-tab="category"]');
    // Modificado para exibir a aba de categorias para cursos E trilhas
    if (sess.type === 'manual_course' || sess.type === 'manual_trail') {
        catTabBtn.style.display = 'flex';
        populateCategoriesForContentPopover(sess.contentCategoryIds || []);
    } else {
        catTabBtn.style.display = 'none';
    }
    let itemsInd=(sess.type==='manual_course')?MOCK_COURSES:MOCK_TRAILS;DOM.contentSearchIndividual.value='';renderIndividualItemsForContentPopover(itemsInd,sess.content);const rect=btnEl.getBoundingClientRect();DOM.contentSelectionPopover.style.top=`${rect.bottom+window.scrollY+5}px`;let leftPos=rect.left+window.scrollX-(DOM.contentSelectionPopover.offsetWidth/2)+(btnEl.offsetWidth/2);if(leftPos+DOM.contentSelectionPopover.offsetWidth>window.innerWidth-10)leftPos=window.innerWidth-DOM.contentSelectionPopover.offsetWidth-10;DOM.contentSelectionPopover.style.left=`${leftPos<10?10:leftPos}px`;DOM.contentSelectionPopover.style.display='block';DOM.contentSearchIndividual.focus();}
    function renderIndividualItemsForContentPopover(items,selIds=[],term=''){DOM.contentListIndividual.innerHTML='';items.filter(i=>i.name.toLowerCase().includes(term.toLowerCase())).forEach(item=>{const div=document.createElement('div');const cb=document.createElement('input');cb.type='checkbox';cb.id=`pi-${item.id}`;cb.value=item.id;cb.checked=selIds.includes(item.id);const lbl=document.createElement('label');lbl.htmlFor=`pi-${item.id}`;lbl.textContent=item.name;div.append(cb,lbl);DOM.contentListIndividual.appendChild(div);});}
    function populateCategoriesForContentPopover(selCatIds=[],term=''){DOM.contentListCategory.innerHTML='';MOCK_CATEGORIES.filter(cat=>cat.name.toLowerCase().includes(term.toLowerCase())).forEach(cat=>{const div=document.createElement('div');const cb=document.createElement('input');cb.type='checkbox';cb.id=`pc-${cat.id}`;cb.value=cat.id;cb.checked=selCatIds.includes(cat.id);const lbl=document.createElement('label');lbl.htmlFor=`pc-${cat.id}`;lbl.textContent=cat.name;div.append(cb,lbl);DOM.contentListCategory.appendChild(div);});}
    function handleContentSearchIndividualEvt(){const sess=sessions.find(s=>s.id===editingContentSessionId);if(!sess)return;let items=(sess.type==='manual_course')?MOCK_COURSES:MOCK_TRAILS;renderIndividualItemsForContentPopover(items,sess.content,DOM.contentSearchIndividual.value);}
    function handleContentSearchCategoryEvt(){const sess=sessions.find(s=>s.id===editingContentSessionId);populateCategoriesForContentPopover(sess?.contentCategoryIds||[],DOM.contentSearchCategory.value);}
    function confirmContentSelectionEvt(){const sess=sessions.find(s=>s.id===editingContentSessionId);if(!sess){closeContentPopover();return;}let newContIds=new Set(sess.content);Array.from(DOM.contentListIndividual.querySelectorAll('input:checked')).forEach(cb=>newContIds.add(cb.value));
    // Modificado para salvar categorias selecionadas para cursos E trilhas
    if(sess.type==='manual_course'||sess.type==='manual_trail'){
        const selCatCbs=Array.from(DOM.contentListCategory.querySelectorAll('input:checked'));
        sess.contentCategoryIds=selCatCbs.map(cb=>cb.value);
        // Para sessões de trilha, vamos adicionar TODAS as trilhas da categoria selecionada ao content individual
        if (sess.type === 'manual_trail') {
             selCatCbs.forEach(cbCat => {
                 MOCK_TRAILS.forEach(trail => {
                     // Nota: MOCK_TRAILS não tem categoryIds. Esta lógica precisará ser ajustada
                     // se a estrutura de dados MOCK_TRAILS for atualizada para incluir categorias.
                     // Por enquanto, esta parte pode não adicionar nada.
                     // Se trilhas pudessem ter categorias, a lógica seria:
                     // if (trail.categoryIds && trail.categoryIds.includes(cbCat.value)) {
                     //    newContIds.add(trail.id);
                     // }
                 });
             });
         } else { // Lógica existente para cursos
             selCatCbs.forEach(cbCat=>{MOCK_COURSES.forEach(crs=>{if(crs.categoryIds&&crs.categoryIds.includes(cbCat.value))newContIds.add(crs.id);});});
         }
    }
    sess.content=Array.from(newContIds);showToast('Conteúdo atualizado!');renderSessions();closeContentPopover();}
    function handleSessionDragStart(e) {
        // Verifica se o arrasto começou no botão de arrastar (.drag-handle-btn)
        if (e.target.closest('.drag-handle-btn')) {
            draggedSessionElement = e.target.closest('.session-card');
            if (draggedSessionElement) {
                draggedSessionElement.classList.add('dragging');
                // Definir o elemento que está sendo arrastado
                e.dataTransfer.setData('text/plain', draggedSessionElement.dataset.sessionId);
                // Definir a imagem de arrasto como o próprio card
                e.dataTransfer.effectAllowed = 'move';
            }
        }
    }
    function handleSessionDragEnd(e){if(draggedSessionElement){draggedSessionElement.classList.remove('dragging');draggedSessionElement=null;}document.querySelectorAll('.drag-over-session, .drag-over-top, .drag-over-bottom').forEach(el=>el.classList.remove('drag-over-session', 'drag-over-top', 'drag-over-bottom'));}
    function handleSessionDragOver(e) {
        e.preventDefault();
        if (!draggedSessionElement) return;
        
        const tgtCard = e.target.closest('.session-card');
        if (!tgtCard || tgtCard === draggedSessionElement) return;

        // Remove classes anteriores
        document.querySelectorAll('.drag-over-session, .drag-over-top, .drag-over-bottom').forEach(el => {
            el.classList.remove('drag-over-session', 'drag-over-top', 'drag-over-bottom');
        });

        // Adiciona classe de arrastar sobre
        tgtCard.classList.add('drag-over-session');

        // Determina a posição de soltura
        const rect = tgtCard.getBoundingClientRect();
        const mouseY = e.clientY;
        const threshold = rect.top + (rect.height / 2);

        if (mouseY < threshold) {
            tgtCard.classList.add('drag-over-top');
        } else {
            tgtCard.classList.add('drag-over-bottom');
        }
    }
    function handleSessionDrop(e) {
        e.preventDefault();
        if (!draggedSessionElement) return;
        
        let tgtCard = e.target.closest('.session-card'); // Tenta encontrar o card mais próximo do target do evento
        document.querySelectorAll('.drag-over-session').forEach(el => el.classList.remove('drag-over-session'));
        
        // Se a soltura não ocorreu diretamente sobre um card, tenta encontrar o card de destino pela posição Y do mouse
        if (!tgtCard || tgtCard === draggedSessionElement) {
            const cards = Array.from(DOM.sessionsListContainer.querySelectorAll('.session-card'));
            const mouseY = e.clientY;
            
            // Encontra o card cuja metade superior está mais próxima da posição Y do mouse
            tgtCard = cards.find(card => {
                const rect = card.getBoundingClientRect();
                return mouseY < rect.top + rect.height / 2;
            }) || cards[cards.length - 1]; // Se mouseY for maior que a metade de todos, usa o último card
            
            if (!tgtCard || tgtCard === draggedSessionElement) {
                draggedSessionElement = null; // Reseta se ainda não encontrou um alvo válido
                return;
            }   
        }
        
        // Garante que a soltura ocorreu sobre um card válido diferente do que está sendo arrastado
        if (tgtCard && tgtCard !== draggedSessionElement) {
            const dragId = draggedSessionElement.dataset.sessionId;
            const tgtId = tgtCard.dataset.sessionId;
            
            const dragIdx = sessions.findIndex(s => s.id === dragId);
            const tgtIdx = sessions.findIndex(s => s.id === tgtId); // Encontra o índice do alvo antes de remover
            
            if (dragIdx === -1 || tgtIdx === -1) return; // Sai se algum não for encontrado
            
            const [draggedSess] = sessions.splice(dragIdx, 1); // Remove o item arrastado
            
            // Determina o índice de inserção após a remoção
            // Se o alvo original estava antes do item arrastado, o índice do alvo não mudou
            // Se o alvo original estava depois do item arrastado, o índice do alvo diminuiu em 1
            let insertIdx = tgtIdx;
            if (dragIdx < tgtIdx) {
                insertIdx--;
            }
            
            // Determina a posição exata de soltura (antes ou depois do alvo)
            const rect = tgtCard.getBoundingClientRect();
            const mouseY = e.clientY;
            const threshold = rect.top + (rect.height / 2);
            
            if (mouseY > threshold) {
                insertIdx++; // Inserir depois do alvo
            }
            
            // Garante que o índice de inserção é válido
            insertIdx = Math.max(0, Math.min(sessions.length, insertIdx));
            
            sessions.splice(insertIdx, 0, draggedSess); // Insere o item arrastado na nova posição
            
            // Atualizar a ordem de todas as sessões
            sessions.forEach((s, idx) => s.order = idx);
            
            // Salvar no localStorage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
            
            renderSessions();
            showToast('Ordem das sessões atualizada!');
        }
        draggedSessionElement = null;
    }
    function handleContentTagDragStart(e){if(e.target.classList.contains('content-tag')){draggedContentTagElement=e.target;draggedContentParentSessionId=e.target.closest('.content-tags-container').dataset.sessionId;e.target.classList.add('dragging');e.dataTransfer.effectAllowed='move';}}
    function handleContentTagDragEnd(e){if(draggedContentTagElement)draggedContentTagElement.classList.remove('dragging');draggedContentTagElement=null;draggedContentParentSessionId=null;document.querySelectorAll('.drag-over-tag-container, .drag-over-top, .drag-over-bottom').forEach(el=>el.classList.remove('drag-over-tag-container', 'drag-over-top', 'drag-over-bottom'));}
    function handleContentTagDragOver(e) {
        const tagsCont = e.target.closest('.content-tags-container');
        if (!draggedContentTagElement || !tagsCont || tagsCont.dataset.sessionId !== draggedContentParentSessionId) {
            e.dataTransfer.dropEffect = 'none';
            return;
        }

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Remove classes anteriores
        document.querySelectorAll('.drag-over-tag-container, .drag-over-top, .drag-over-bottom').forEach(el => {
            el.classList.remove('drag-over-tag-container', 'drag-over-top', 'drag-over-bottom');
        });

        // Adiciona classe de arrastar sobre
        tagsCont.classList.add('drag-over-tag-container');

        const tgtTag = e.target.closest('.content-tag');
        if (tgtTag && tgtTag !== draggedContentTagElement) {
            const rect = tgtTag.getBoundingClientRect();
            const mouseX = e.clientX;
            const threshold = rect.left + (rect.width / 2);

            if (mouseX < threshold) {
                tgtTag.classList.add('drag-over-top');
            } else {
                tgtTag.classList.add('drag-over-bottom');
            }
        }
    }
    function handleContentTagDrop(e) {
        const tagsCont = e.target.closest('.content-tags-container');
        if (tagsCont) {
            tagsCont.classList.remove('drag-over-tag-container');
        }

        if (!draggedContentTagElement || !tagsCont || tagsCont.dataset.sessionId !== draggedContentParentSessionId) {
            return;
        }

        e.preventDefault();
        const sess = sessions.find(s => s.id === draggedContentParentSessionId);
        if (!sess) return;

        const tgtTag = e.target.closest('.content-tag');
        const dragItemId = draggedContentTagElement.dataset.itemId;
        const dragItemIdx = sess.content.indexOf(dragItemId);
        if (dragItemIdx === -1) return;

        const [movedItem] = sess.content.splice(dragItemIdx, 1);

        if (tgtTag && tgtTag.dataset.itemId !== dragItemId) {
            const tgtItemIdx = sess.content.indexOf(tgtTag.dataset.itemId);
            if (tgtItemIdx !== -1) {
                const rect = tgtTag.getBoundingClientRect();
                const mouseX = e.clientX;
                const threshold = rect.left + (rect.width / 2);
                sess.content.splice(mouseX < threshold ? tgtItemIdx : tgtItemIdx + 1, 0, movedItem);
            } else {
                sess.content.push(movedItem);
            }
        } else {
            sess.content.push(movedItem);
        }

        // Remove todas as classes de arrastar
        document.querySelectorAll('.drag-over-tag-container, .drag-over-top, .drag-over-bottom').forEach(el => {
            el.classList.remove('drag-over-tag-container', 'drag-over-top', 'drag-over-bottom');
        });

        renderSessions();
        showToast('Ordem do conteúdo atualizada!');
        draggedContentTagElement = null;
        draggedContentParentSessionId = null;
    }
    function handleSessionsListClickEvt(e){
        console.log('Click event on sessions list container', e.target); // Log para ver o elemento clicado
        const sessCard=e.target.closest('.session-card');
        if(!sessCard)return;
        const sessId=sessCard.dataset.sessionId;
        console.log('Clicked session card ID:', sessId); // Log para ver o ID da sessão

        if(e.target.closest('.session-card-status[data-action="open-schedule-popover"]')){
            // Fechar dropdowns de criação de sessão antes de abrir o popover de agendamento
            DOM.createSessionOptionsContainer.style.display = 'none';
            DOM.emptyStateCreateSessionOptionsContainer.style.display = 'none';

            closeContentPopover();
            closeSchedulePopover();
            openSchedulePopover(sessId,e.target.closest('.session-card-status'));
        }else if(e.target.closest('.delete-session-btn')){
            // Fechar dropdowns de criação de sessão antes de abrir o modal de exclusão
            DOM.createSessionOptionsContainer.style.display = 'none';
            DOM.emptyStateCreateSessionOptionsContainer.style.display = 'none';

            const sess=sessions.find(s=>s.id===sessId);
            deletingSessionId=sessId;
            // DOM.sessionToDeleteNameEl.textContent = sess.title; // Não usamos textContent puro mais aqui

            // Modificar a mensagem do modal de exclusão se houver conteúdo na sessão
            if (sess.content && sess.content.length > 0) {
                DOM.sessionToDeleteNameEl.innerHTML = `<strong>${sess.title}</strong><br><br><span>Esta sessão contém ${sess.content.length} conteúdo(s) adicionado(s). Excluir removerá o(s) conteúdo(s) da sessão.</span>`;
            } else {
                DOM.sessionToDeleteNameEl.innerHTML = `<strong>${sess.title}</strong>`;
            }
            
            openModal('confirm-delete-modal');
        }else if(e.target.classList.contains('add-content-btn')||e.target.closest('.add-content-btn')){
            // Fechar dropdowns de criação de sessão antes de abrir o popover de conteúdo
            DOM.createSessionOptionsContainer.style.display = 'none';
            DOM.emptyStateCreateSessionOptionsContainer.style.display = 'none';

            closeSchedulePopover();
            const btn=e.target.classList.contains('add-content-btn')?e.target:e.target.closest('.add-content-btn');
            populateContentPopover(sessId,btn);
        }

        // Handle move up/down button clicks
        const moveUpBtn = e.target.closest('.move-up-btn');
        const moveDownBtn = e.target.closest('.move-down-btn');

        if (moveUpBtn) {
            moveSession(sessId, 'up');
        } else if (moveDownBtn) {
            moveSession(sessId, 'down');
        }

        // Handle remove tag button clicks (for both content items and categories)
        const removeTagBtn = e.target.closest('.remove-tag-btn');
        console.log('Remove tag button clicked:', removeTagBtn); // Log para ver se o botão é encontrado
        if (removeTagBtn) {
            const sess = sessions.find(s => s.id === removeTagBtn.dataset.sessionId);
            console.log('Found session for removal:', sess); // Log para ver se a sessão é encontrada
            if (sess) {
                const itemIdToRemove = removeTagBtn.dataset.itemId;
                const categoryIdToRemove = removeTagBtn.dataset.categoryId;
                console.log('Item ID to remove:', itemIdToRemove); // Log para ver o ID do item
                console.log('Category ID to remove:', categoryIdToRemove); // Log para ver o ID da categoria

                if (itemIdToRemove) { // Removing an individual content item
                    sess.content = sess.content.filter(id => id !== itemIdToRemove);
                    showToast('Conteúdo removido.');
                } else if (categoryIdToRemove && sess.contentCategoryIds) { // Removing a category
                    sess.contentCategoryIds = sess.contentCategoryIds.filter(id => id !== categoryIdToRemove);
                    showToast('Categoria removida.');
                }
                renderSessions(); // Re-render after removal
            }
        }

        // Adicionar listener para o select de filtro de tipo de matrícula
        if (e.target.classList.contains('enrollment-type-filter')) {
            const selectElement = e.target;
            const sessId = selectElement.dataset.sessionId;
            const sess = sessions.find(s => s.id === sessId);
            if (sess) {
                sess.enrollmentTypeFilter = selectElement.value;
                showToast('Filtro de matrícula atualizado!');
                // Não precisa renderizar a lista inteira novamente, apenas atualizar o estado.
                // Futuramente, a renderização poderá filtrar a lista exibida com base neste filtro.
            }
        }
    }
    function confirmSessionDeleteEvt(){if(deletingSessionId){sessions=sessions.filter(s=>s.id!==deletingSessionId);renderSessions();showToast('Sessão excluída.');closeModal('confirm-delete-modal');deletingSessionId=null;}}
    function handleGlobalClickForPopovers(event){
        const isAddBtn = event.target.classList.contains('add-content-btn') || event.target.closest('.add-content-btn');
        const isPageCreateBtn = event.target.id === 'page-create-session-dropdown-btn' || event.target.closest('#page-create-session-dropdown-btn');
        const isEmptyStateCreateBtn = event.target.id === 'empty-state-create-session-dropdown-btn' || event.target.closest('#empty-state-create-session-dropdown-btn');
        const isAnyCreateBtn = isPageCreateBtn || isEmptyStateCreateBtn;
        const isSchedStatus = event.target.closest('.session-card-status[data-action="open-schedule-popover"]');

        // Close content selection popover
        if(DOM.contentSelectionPopover && DOM.contentSelectionPopover.style.display === 'block' && !DOM.contentSelectionPopover.contains(event.target) && !isAddBtn)
            closeContentPopover();

        // Close header create session dropdown unless clicking inside it or its button
        if (DOM.createSessionOptionsContainer.style.display === 'block' && !DOM.createSessionOptionsContainer.contains(event.target) && !isPageCreateBtn) {
             DOM.createSessionOptionsContainer.style.display = 'none';
        }

        // Close empty state create session dropdown unless clicking inside it or its button
         if (DOM.emptyStateCreateSessionOptionsContainer.style.display === 'block' && !DOM.emptyStateCreateSessionOptionsContainer.contains(event.target) && !isEmptyStateCreateBtn) {
             DOM.emptyStateCreateSessionOptionsContainer.style.display = 'none';
         }

        // Close schedule popover
        if(DOM.schedulePopover.style.display === 'block' && !DOM.schedulePopover.contains(event.target) && !isSchedStatus)
            closeSchedulePopover();

        // Close enrollment type select popover
        const enrollmentTypePopover = document.getElementById('enrollment-type-select-popover');
        const isEnrollmentChip = event.target.classList.contains('enrollment-type-filter-chip') || event.target.closest('.enrollment-type-filter-chip');
        if (enrollmentTypePopover && enrollmentTypePopover.style.display === 'block' && !enrollmentTypePopover.contains(event.target) && !isEnrollmentChip) {
            closeEnrollmentTypeSelectPopover();
        }

        // Explicitly close the *other* create session dropdown if one is clicked
        if (isPageCreateBtn && DOM.emptyStateCreateSessionOptionsContainer.style.display === 'block') {
             DOM.emptyStateCreateSessionOptionsContainer.style.display = 'none';
        }
        if (isEmptyStateCreateBtn && DOM.createSessionOptionsContainer.style.display === 'block') {
             DOM.createSessionOptionsContainer.style.display = 'none';
        }

    }
    function handleModuleTabClickEvt(event){const tab = event.currentTarget; if(tab.disabled)return;

        // Fechar dropdowns de criação de sessão ao trocar de aba
        DOM.createSessionOptionsContainer.style.display = 'none';
        DOM.emptyStateCreateSessionOptionsContainer.style.display = 'none';

        DOM.moduleTabs.forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        currentModuleId=tab.dataset.module;
        updateAllCreateSessionOptions();
        renderSessions();
    }
    function saveAllChangesEvt(){localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(sessions));showToast('Alterações salvas (simulado)!','info');}
    
    function init() {
        const saved=localStorage.getItem(LOCAL_STORAGE_KEY);if(saved){sessions=JSON.parse(saved);sessions.forEach((s,idx)=>{if(s.order===undefined)s.order=idx;});}
        const activeModTab=document.querySelector(`.module-tab[data-module="${currentModuleId}"]`);if(activeModTab)activeModTab.classList.add('active');
        updateAllCreateSessionOptions(); renderSessions();

        // Ensure popovers are hidden on init
        if (DOM.schedulePopover) DOM.schedulePopover.style.display = 'none';
        if (DOM.contentSelectionPopover) DOM.contentSelectionPopover.style.display = 'none';
        // Ensure empty state dropdown is hidden on init
        if (DOM.emptyStateCreateSessionOptionsContainer) DOM.emptyStateCreateSessionOptionsContainer.style.display = 'none';

        DOM.createSessionDropdownBtn.addEventListener('click',(e)=>{e.stopPropagation();DOM.createSessionOptionsContainer.style.display=DOM.createSessionOptionsContainer.style.display==='block'?'none':'block';});

        // Add event listener for empty state create button
        if (DOM.emptyStateCreateSessionDropdownBtn) {
            console.log('Empty state create button found, adding event listener.'); // Log para depuração
            DOM.emptyStateCreateSessionDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other popovers if open
                closeSchedulePopover();
                closeContentPopover();
                // Toggle empty state dropdown
                DOM.emptyStateCreateSessionOptionsContainer.style.display = DOM.emptyStateCreateSessionOptionsContainer.style.display === 'block' ? 'none' : 'block';
            });
        } else {
            console.warn('Empty state create button not found!'); // Mudando para warning ao invés de error
        }

        // Global click handler to close popovers/dropdowns when clicking outside
        document.addEventListener('click', handleGlobalClickForPopovers);

        // Bind other event listeners
        DOM.sessionsListContainer.addEventListener('focusin',handleInlineEditFocusIn);
        DOM.sessionsListContainer.addEventListener('focusout',handleInlineEditFocusOut);
        DOM.sessionsListContainer.addEventListener('keydown',handleInlineEditKeyDown);
        DOM.sessionsListContainer.addEventListener('click',handleSessionsListClickEvt);
        DOM.schedulePopoverSaveBtn.addEventListener('click',saveSchedule);
        DOM.schedulePopoverCancelBtn.addEventListener('click',closeSchedulePopover);
        DOM.schedulePopoverClearBtn.addEventListener('click',clearSchedule);
        DOM.popoverTabBtns.forEach(btn=>btn.addEventListener('click',handleContentPopoverTabClick));
        DOM.contentSearchIndividual.addEventListener('input',handleContentSearchIndividualEvt);
        DOM.contentSearchCategory.addEventListener('input',handleContentSearchCategoryEvt);
        DOM.contentConfirmBtn.addEventListener('click',confirmContentSelectionEvt);
        DOM.contentCancelBtn.addEventListener('click',closeContentPopover);
        DOM.confirmDeleteBtn.addEventListener('click',confirmSessionDeleteEvt);
        DOM.moduleTabs.forEach(tab=>tab.addEventListener('click',handleModuleTabClickEvt));
        DOM.saveAllBtn.addEventListener('click',saveAllChangesEvt);
        DOM.sessionsListContainer.addEventListener('dragstart',handleSessionDragStart);
        DOM.sessionsListContainer.addEventListener('dragend',handleSessionDragEnd);
        DOM.sessionsListContainer.addEventListener('dragover',handleSessionDragOver);
        DOM.sessionsListContainer.addEventListener('drop',handleSessionDrop);
        DOM.sessionsListContainer.addEventListener('dragstart',handleContentTagDragStart);
        DOM.sessionsListContainer.addEventListener('dragend',handleContentTagDragEnd);
        DOM.sessionsListContainer.addEventListener('dragover',handleContentTagDragOver);
        DOM.sessionsListContainer.addEventListener('dragleave',handleContentTagDragEnd);
        DOM.sessionsListContainer.addEventListener('drop',handleContentTagDrop);

        // Habilitar 'Eventos' tab
        const eventosTab = document.querySelector('.module-tab[data-module="eventos"]');
        if (eventosTab) {
            eventosTab.disabled = false; // Habilitar o botão
            eventosTab.classList.remove('disabled-tab'); // Remover classe de desativado, se houver
        }
    }

    // Funções para o novo popover de seleção de tipo de matrícula
    function openEnrollmentTypeSelectPopover(sessionId, triggerElement) {
        const popover = document.getElementById('enrollment-type-select-popover');
        if (!popover) return;

        // Fechar outros popovers/dropdowns abertos
        closeSchedulePopover();
        closeContentPopover();
        DOM.createSessionOptionsContainer.style.display = 'none';
        DOM.emptyStateCreateSessionOptionsContainer.style.display = 'none';

        // Posicionar o popover abaixo do chip
        const rect = triggerElement.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const style = getComputedStyle(document.documentElement);
        const edgeMargin = parseInt(style.getPropertyValue('--spacing-xs').replace('px', ''), 10);

        const topPos = rect.bottom + window.scrollY + parseInt(style.getPropertyValue('--spacing-xxs').replace('px', ''), 10);
        popover.style.top = `${topPos}px`;

        // Mostrar temporariamente para medir a largura
        popover.style.visibility = 'hidden';
        popover.style.display = 'block';

        const popoverWidth = popover.offsetWidth;
        let leftPos = rect.left + window.scrollX;

        // Ajustar posição se ultrapassar a borda direita
        if (leftPos + popoverWidth > windowWidth - edgeMargin) {
            leftPos = windowWidth - edgeMargin - popoverWidth;
        }

        // Garantir que não fique muito para a esquerda
        leftPos = Math.max(edgeMargin, leftPos);

        popover.style.left = `${leftPos}px`;
        popover.dataset.sessionId = sessionId; // Salvar o ID da sessão no popover

        // Marcar a opção selecionada no popover
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            popover.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('selected');
                // Marcar como selecionado se o data-filter-value for igual ao enrollmentTypeFilter
                // ou se o filtro for null e o botão for 'all'
                if (btn.dataset.filterValue === session.enrollmentTypeFilter || (session.enrollmentTypeFilter === null && btn.dataset.filterValue === 'all')) {
                    btn.classList.add('selected');
                }
            });
        }

        // Tornar visível
        popover.style.visibility = 'visible';
    }

    function closeEnrollmentTypeSelectPopover() {
        const popover = document.getElementById('enrollment-type-select-popover');
        if (popover) {
            popover.style.display = 'none';
            popover.removeAttribute('data-session-id');
        }
    }

    function handleEnrollmentTypeSelect(event) {
        const selectedButton = event.target.closest('button');
        if (!selectedButton) return;

        const popover = selectedButton.closest('#enrollment-type-select-popover');
        if (!popover) return;

        const sessId = popover.dataset.sessionId;
        const selectedFilter = selectedButton.dataset.filterValue;

        const session = sessions.find(s => s.id === sessId);
        if (session) {
            session.enrollmentTypeFilter = selectedFilter;
            showToast('Filtro de matrícula atualizado!');
            renderSessions(); // Renderizar novamente para atualizar o chip
        }

        closeEnrollmentTypeSelectPopover();
    }

    // New function to move a session up or down
    function moveSession(sessionId, direction) {
        const currentIdx = sessions.findIndex(s => s.id === sessionId);
        if (currentIdx === -1) return;

        const newIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;

        // Check if the new index is within bounds
        if (newIdx >= 0 && newIdx < sessions.length) {
            // Swap the sessions
            const [movedSession] = sessions.splice(currentIdx, 1);
            sessions.splice(newIdx, 0, movedSession);

            // Update the order property and save
            sessions.forEach((s, idx) => s.order = idx);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));

            renderSessions(); // Re-render the list
            showToast('Ordem da sessão atualizada!');
        }
    }

    return { init };
})();
// ==== END: SESSÕES PERSONALIZADAS PAGE SCRIPT ====

document.addEventListener('DOMContentLoaded',function(){
    initializeCustomSidebarMenu(); 
    initializeCustomTopBar();
    const sessLnkNewMenu=document.querySelector('#myCustomSidebarMenu a[data-nav-id="sessoes-personalizadas"]');
    const adminTogNewMenu=document.getElementById('cs-admin-toggle');
    if(sessLnkNewMenu&&adminTogNewMenu){
        sessLnkNewMenu.parentElement.classList.add('cs-active-submenu-item');
        adminTogNewMenu.classList.add('cs-active'); 
    }
    SessaoPersonalizadaApp.init();
});