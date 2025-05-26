// Arquivo: conteudos.js

// Dados mockados de cursos
const MOCK_COURSES = [
    { id: 'course-1', title: 'Gerenciamento de Conflitos: Como Lidar com Desafios', image: 'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', time: '1h 30min', language: 'PT-BR' },
    { id: 'course-2', title: 'Introdução ao Marketing Digital para Iniciantes', image: 'https://images.pexels.com/photos/5926396/pexels-photo-5926396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', time: '2h 15min', language: 'EN' },
    { id: 'course-3', title: 'Fundamentos de Liderança e Trabalho em Equipe', image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', time: '1h 00min', language: 'PT-BR' },
    { id: 'course-4', title: 'Excelência no Atendimento ao Cliente', image: 'https://images.pexels.com/photos/3184411/pexels-photo-3184411.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', time: '1h 30min', language: 'PT-BR' },
     { id: 'course-5', title: 'Introdução à Análise de Dados', image: 'https://images.pexels.com/photos/1068523/pexels-photo-1068523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', time: '3h 00min', language: 'EN' },
      { id: 'course-6', title: 'Design Thinking Essencial', image: 'https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', time: '1h 45min', language: 'PT-BR' },
];

// Dados mockados de seções, associados a filtros
const MOCK_SECTIONS = [
    {
        id: 'section-1',
        filter: 'destaques',
        title: 'Finalize estes cursos',
        description: 'Conclua os cursos que você já começou!',
        content: ['course-1', 'course-2', 'course-3', 'course-4', 'course-5', 'course-6'],
    },
    {
        id: 'section-2',
        filter: 'destaques',
        title: 'Novidades para você',
        description: 'Descubra novos conteúdos alinhados aos seus interesses.',
        content: ['course-4', 'course-1', 'course-5', 'course-2'],
    },
     {
        id: 'section-3',
        filter: 'cursos',
        title: 'Todos os Cursos',
        description: 'Explore nosso catálogo completo de cursos.',
        content: ['course-1', 'course-2', 'course-3', 'course-4', 'course-5', 'course-6', 'course-1', 'course-2'], // Conteúdo duplicado para testar scroll
    },
      {
        id: 'section-4',
        filter: 'trilhas',
        title: 'Trilhas Recomendadas',
        description: 'Sugestões de trilhas para seu desenvolvimento.',
        content: ['course-3', 'course-6'],
    },
     {
        id: 'section-5',
        filter: 'eventos',
        title: 'Próximos Eventos',
        description: 'Não perca nossos próximos eventos ao vivo.',
        content: ['course-4', 'course-5'],
    },
];

/**
 * Referências aos elementos do DOM.
 */
const DOM = {};

/**
 * Inicializa a lógica da página de conteúdos.
 * Esta função deve ser chamada quando a página for carregada ou a visão de conteúdo for ativada.
 */
function initConteudosPage() {
    console.log('Página de Conteúdos inicializada.');

    // Obter referências aos elementos do DOM
    DOM.navChipsContainer = document.querySelector('.conteudos-nav-chips');
    DOM.navChips = document.querySelectorAll('.conteudos-nav-chips .chip');
    DOM.sectionsContainer = document.querySelector('.conteudos-sections-container');

    if (!DOM.navChipsContainer || DOM.navChips.length === 0 || !DOM.sectionsContainer) {
        console.error('Elementos essenciais para os chips de navegação ou seções não encontrados.');
        return;
    }

    // Configurar event listeners para os chips
    DOM.navChips.forEach(chip => {
        chip.addEventListener('click', handleChipClick);
    });

    // Renderizar as seções iniciais (por padrão, Destaques)
    renderFilteredSections('destaques'); // Chama a função para renderizar seções baseado no filtro

    // Inicializar a barra lateral personalizada
    initializeCustomSidebarMenu(); // Chama a função para ativar a lógica do submenu
}

/**
 * Trata o evento de clique em um chip de navegação.
 * @param {Event} event - O objeto do evento de clique.
 */
function handleChipClick(event) {
    const clickedChip = event.currentTarget; // O botão do chip clicado

    // Remover a classe 'active' de todos os chips
    DOM.navChips.forEach(chip => {
        chip.classList.remove('active');
    });

    // Adicionar a classe 'active' apenas ao chip clicado
    clickedChip.classList.add('active');

    // Obter o filtro de dados do chip clicado
    const selectedFilter = clickedChip.dataset.filter;
    console.log('Chip clicado:', selectedFilter);

    // Renderizar as seções com base no filtro selecionado
    renderFilteredSections(selectedFilter);
}

/**
 * Função para renderizar as seções de conteúdo baseadas no filtro selecionado.
 * @param {string} filter - O filtro selecionado (ex: 'destaques', 'trilhas', 'cursos', 'eventos').
 */
function renderFilteredSections(filter) {
    console.log(`Renderizando seções para o filtro: ${filter}`);

    // Limpar o container de seções atual
    DOM.sectionsContainer.innerHTML = '';

    // Filtrar as seções com base no filtro selecionado
    const sectionsToRender = MOCK_SECTIONS.filter(section => section.filter === filter);

    // Renderizar cada seção filtrada
    sectionsToRender.forEach(section => {
        const sectionElement = createSectionElement(section);
        DOM.sectionsContainer.appendChild(sectionElement);
    });
}

/**
 * Cria o elemento HTML para uma seção de conteúdo.
 * @param {object} sectionData - Dados da seção (id, title, description, content).
 * @returns {HTMLElement} O elemento div representando a seção.
 */
function createSectionElement(sectionData) {
    const sectionDiv = document.createElement('div');
    sectionDiv.classList.add('conteudo-section');
    sectionDiv.dataset.sectionId = sectionData.id; // Adicionar ID da seção para referência

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('conteudo-section-header');

    const sectionInfoDiv = document.createElement('div');
    sectionInfoDiv.classList.add('section-info');

    const titleElement = document.createElement('h3');
    titleElement.textContent = sectionData.title;

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = sectionData.description;

    sectionInfoDiv.appendChild(titleElement);
    sectionInfoDiv.appendChild(descriptionElement);

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('section-actions');

    const viewAllLink = document.createElement('a');
    viewAllLink.href = '#'; // Link placeholder
    viewAllLink.classList.add('view-all-link');
    viewAllLink.textContent = 'Ver tudo';

    const prevButton = document.createElement('button');
    prevButton.classList.add('nav-arrow-button', 'prev-arrow'); // Adicionar classe para identificar
    prevButton.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
    // Event listener será adicionado após a seção ser anexada ao DOM

    const nextButton = document.createElement('button');
    nextButton.classList.add('nav-arrow-button', 'next-arrow'); // Adicionar classe para identificar
    nextButton.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
     // Event listener será adicionado após a seção ser anexada ao DOM

    actionsDiv.appendChild(viewAllLink);
    actionsDiv.appendChild(prevButton);
    actionsDiv.appendChild(nextButton);

    headerDiv.appendChild(sectionInfoDiv);
    headerDiv.appendChild(actionsDiv);

    const scrollSectionDiv = document.createElement('div');
    scrollSectionDiv.classList.add('horizontal-scroll-section');

    // Adicionar cards de curso à seção de scroll
    sectionData.content.forEach(courseId => {
        const course = MOCK_COURSES.find(c => c.id === courseId);
        if (course) {
            const cardElement = createCourseCardElement(course);
            scrollSectionDiv.appendChild(cardElement);
        }
    });

    sectionDiv.appendChild(headerDiv);
    sectionDiv.appendChild(scrollSectionDiv);

    // Adicionar event listeners para as setas após a seção ser montada (para garantir que scrollSectionDiv exista)
     sectionDiv.addEventListener('click', (event) => {
        const scrollContainer = sectionDiv.querySelector('.horizontal-scroll-section');
        if (!scrollContainer) return;

        if (event.target.closest('.nav-arrow-button.prev-arrow')) {
            scrollContainer.scrollBy({ left: -scrollContainer.offsetWidth, behavior: 'smooth' });
        } else if (event.target.closest('.nav-arrow-button.next-arrow')) {
            scrollContainer.scrollBy({ left: scrollContainer.offsetWidth, behavior: 'smooth' });
        }
    });

    return sectionDiv;
}

/**
 * Cria o elemento HTML para um card de curso.
 * @param {object} courseData - Dados do curso (id, title, image, time, language).
 * @returns {HTMLElement} O elemento div representando o card de curso.
 */
function createCourseCardElement(courseData) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('course-card-placeholder'); // Mantém a classe para estilos de tamanho e proporção
    cardDiv.dataset.bgImage = courseData.image; // Define a imagem de fundo via data attribute

    // Remover estilos inline que foram movidos para o CSS
    cardDiv.style.backgroundImage = '';
    cardDiv.style.backgroundSize = '';
    cardDiv.style.backgroundPosition = '';
    cardDiv.style.position = '';
    cardDiv.style.color = '';
    cardDiv.style.padding = '';
    cardDiv.style.display = '';
    cardDiv.style.flexDirection = '';
    cardDiv.style.justifyContent = '';
    cardDiv.style.textShadow = '';
    cardDiv.style.border = ''; // Remover borda tracejada placeholder

    const cardContentDiv = document.createElement('div');
    cardContentDiv.classList.add('card-content'); // Nova classe para o conteúdo interno

    const titleElement = document.createElement('h4'); // Usar h4 para título do card
    titleElement.textContent = courseData.title;

    const infoElement = document.createElement('p');
    infoElement.textContent = `${courseData.language} | ${courseData.time}`;

    cardContentDiv.appendChild(titleElement);
    cardContentDiv.appendChild(infoElement);

    // Adicionar um overlay escuro (opcional, se o design final usar)
    // const overlayDiv = document.createElement('div');
    // overlayDiv.classList.add('card-overlay'); // Adicionar classe para estilizar no CSS
    // cardDiv.appendChild(overlayDiv);

    cardDiv.appendChild(cardContentDiv);

    return cardDiv;
}

/**
 * Função placeholder para carregar os dados do conteúdo (banner, seções de cursos).
 * Esta função precisará ser implementada para buscar dados de uma API ou fonte local.
 */
function loadContentData() {
    console.log('Carregando dados de conteúdo...');
    // Implementar lógica de fetching de dados aqui
    // Ex: fetch('/api/conteudos').then(response => response.json()).then(data => {
    //     renderBanner(data.banner);
    //     renderCourseSections(data.sections);
    // });
}

/**
 * Função placeholder para renderizar o banner na página.
 * @param {object} bannerData - Dados do banner a ser exibido.
 */
function renderBanner(bannerData) {
    console.log('Renderizando banner:', bannerData);
    // Implementar lógica para exibir os dados do banner no HTML
    // Ex: document.querySelector('.conteudos-banner h2').textContent = bannerData.title;
    // Ex: definir imagem de fundo, etc.
}

/**
 * Função placeholder para renderizar as seções de cursos horizontais.
 * @param {Array<object>} sectionsData - Array de objetos, cada um representando uma seção de cursos.
 */
function renderCourseSections(sectionsData) {
    console.log('Renderizando seções de cursos:', sectionsData);
    // Implementar lógica para criar e popular as seções horizontais com cards de cursos
    // Para cada seção em sectionsData:
    //   - Criar um título (h3)
    //   - Criar um container para scroll horizontal (div.horizontal-scroll-section)
    //   - Para cada curso na seção:
    //     - Criar um card de curso com aspect ratio 9:16
    //     - Adicionar imagem, título, etc.
    //     - Anexar o card ao container de scroll
    //   - Anexar o título e o container de scroll ao .conteudos-sections-container
}

/**
 * Função placeholder para configurar listeners de eventos específicos da página.
 * Ex: botões de navegação horizontal, cliques nos cards, etc.
 */
function setupEventListeners() {
    console.log('Configurando event listeners para a página de conteúdos...');
    // Adicionar listeners para os botões de navegação horizontal, se existirem
    // Adicionar listeners para cliques nos cards de curso, etc.
}

// Chama a função de inicialização quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página de conteúdos antes de inicializar
    // Isso é importante se script.js for carregado em todas as páginas
    if (document.body.classList.contains('page-conteudos')) {
         initConteudosPage();
    }
});

// Exemplo de como você pode adicionar a classe 'page-conteudos' no body do conteudos.html:
// <body class="page-conteudos"> 