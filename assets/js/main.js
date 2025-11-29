document.addEventListener('DOMContentLoaded', () => {

    /* --- 0. Gerenciador de Links de Ambiente --- */
    function updateEnvironmentLinks() {
        if (typeof CONFIG === 'undefined') return;

        // Mapeamento: Classe do HTML -> Chave do Config
        const linkMap = {
            '.js-login-link': 'LOGIN',
            '.js-cadastro-link': 'CADASTRO',
            '.js-validar-link': 'VALIDAR',
            '.js-home-link': 'HOME'
        };

        // Percorre o mapa e atualiza os hrefs
        for (const [selector, configKey] of Object.entries(linkMap)) {
            const links = document.querySelectorAll(selector);
            const targetUrl = getUrl(configKey);

            links.forEach(link => {
                link.href = targetUrl;

                // Lógica de abrir em nova aba apenas para o LOGIN em modo DEV
                if (configKey === 'LOGIN' && CONFIG.CURRENT_ENV === 'DEV') {
                    link.target = '_blank';
                }
            });
        }
    }

    // Executa a atualização
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