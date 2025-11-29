document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Gerenciador de Links de Ambiente (NOVO) ---
    function updateEnvironmentLinks() {
        // Pega todos os elementos com a classe marcadora
        const loginLinks = document.querySelectorAll('.js-login-link');
        
        // Pega a URL correta baseada no CONFIG (Definido no config.js)
        // Se CONFIG não existir (erro de importação), usa #
        const targetUrl = (typeof CONFIG !== 'undefined') ? getUrl('LOGIN') : '#';

        loginLinks.forEach(link => {
            link.href = targetUrl;
            
            // Se for PROD (em-breve), abre na mesma aba. Se for DEV (localhost), abre nova aba pra facilitar
            if (typeof CONFIG !== 'undefined' && CONFIG.CURRENT_ENV === 'DEV') {
                link.target = '_blank';
            }
        });
    }

    // Executa a atualização dos links
    updateEnvironmentLinks();

	/* --- 1. Efeito de Scroll no Header --- */
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            // Se rolar mais que 20px, expande o header
            if (window.scrollY > 20) {
                header.classList.add('expandido');
            } else {
                header.classList.remove('expandido');
            }
        });
    }

    /* --- 2. Lógica do Carrossel com Indicadores --- */
    function setupCarousel(carouselId, intervalTime = 4000) {
        const container = document.getElementById(carouselId);
        if (!container) return; // Se não achar o ID, para a função

        const track = container.querySelector('.carousel-track');
        const images = track.querySelectorAll('img');
        const indicatorsContainer = container.querySelector('.carousel-indicators');
        
        // Se não houver imagens ou container de indicadores, aborta
        if (images.length === 0 || !indicatorsContainer) return;

        let currentIndex = 0;
        const totalSlides = images.length;

        // Cria as bolinhas (indicadores) dinamicamente
        indicatorsContainer.innerHTML = ''; // Limpa antes de criar
        images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('indicator');
            if (index === 0) dot.classList.add('active'); // A primeira começa ativa
            
            // Adiciona evento de clique na bolinha
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetInterval(); // Reinicia o timer se o usuário clicar
            });
            
            indicatorsContainer.appendChild(dot);
        });

        const dots = indicatorsContainer.querySelectorAll('.indicator');

        // Função principal para mudar o slide
        function goToSlide(index) {
            // Lógica de loop infinito
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;

            currentIndex = index;
            
            // Calcula a largura da imagem atual para saber quanto deslizar
            const width = images[0].clientWidth; 
            
            // Move o trilho (track)
            track.style.transform = `translateX(-${width * currentIndex}px)`;

            // Atualiza a classe 'active' das bolinhas
            dots.forEach(d => d.classList.remove('active'));
            if(dots[currentIndex]) {
                dots[currentIndex].classList.add('active');
            }
        }

        // Timer Automático
        let autoPlay = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, intervalTime);

        // Função para reiniciar o timer (usada ao clicar ou redimensionar)
        function resetInterval() {
            clearInterval(autoPlay);
            autoPlay = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, intervalTime);
        }

        // Responsividade: Recalcula a posição se a janela for redimensionada
        window.addEventListener('resize', () => {
            // Pequeno delay para garantir que a largura atualizou
            setTimeout(() => {
                goToSlide(currentIndex);
            }, 100);
        });
    }

    /* --- 3. Inicializa os Carrosséis --- */
    // Carrossel de Novidades (4 segundos)
    setupCarousel('carousel-novidades', 4000);
    
    // Carrossel de Funcionalidades (5 segundos)
    setupCarousel('carousel-funcionalidades', 5000);

});