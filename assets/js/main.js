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
		if (!container) return;

		const track = container.querySelector('.carousel-track');
		// Identifica os slides (filhos diretos do track: img ou a)
		const slides = Array.from(track.children);
		const indicatorsContainer = container.querySelector('.carousel-indicators');

		if (slides.length === 0 || !indicatorsContainer) return;

		let currentIndex = 0;
		const totalSlides = slides.length;
		let autoPlay;

		// Estado do Drag/Swipe
		let isDragging = false;
		let startPos = 0;
		let currentTranslate = 0;
		let prevTranslate = 0;
		let animationID;
		let startX = 0;
		let isClickBlocked = false; // Bloqueia clique se arrastou

		// Cria as bolinhas (indicadores)
		indicatorsContainer.innerHTML = '';
		slides.forEach((_, index) => {
			const dot = document.createElement('div');
			dot.classList.add('indicator');
			if (index === 0) dot.classList.add('active');

			dot.addEventListener('click', (e) => {
				e.stopPropagation(); // Evita borbulhar se necessário
				goToSlide(index);
				resetInterval();
			});

			indicatorsContainer.appendChild(dot);
		});

		const dots = indicatorsContainer.querySelectorAll('.indicator');

		// --- Helpers ---
		function getPositionX(event) {
			return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
		}

		function getSlideWidth() {
			// Largura visual do primeiro slide (deve ser a largura do container)
			const slide = slides[0];
			const style = window.getComputedStyle(track);
			const gap = parseFloat(style.gap) || 0;
			return slide.offsetWidth + gap;
		}

		function setSliderPosition() {
			track.style.transform = `translateX(${currentTranslate}px)`;
		}

		function animation() {
			setSliderPosition();
			if (isDragging) requestAnimationFrame(animation);
		}

		// --- Navegação ---
		function goToSlide(index) {
			if (index < 0) index = totalSlides - 1;
			if (index >= totalSlides) index = 0;

			currentIndex = index;

			const width = getSlideWidth();
			currentTranslate = -currentIndex * width;
			prevTranslate = currentTranslate;

			// Restaura transição para movimento suave do slide
			track.style.transition = 'transform 0.5s ease-in-out';
			setSliderPosition();

			// Atualiza Dots
			dots.forEach(d => d.classList.remove('active'));
			if (dots[currentIndex]) {
				dots[currentIndex].classList.add('active');
			}
		}

		// --- Timer ---
		function startAutoPlay() {
			clearInterval(autoPlay);
			autoPlay = setInterval(() => {
				goToSlide(currentIndex + 1);
			}, intervalTime);
		}

		function resetInterval() {
			clearInterval(autoPlay);
			startAutoPlay();
		}

		startAutoPlay();

		// --- Eventos de Touch/Drag ---

		function touchStart(event) {
			isDragging = true;
			startX = getPositionX(event);

			// Pausa timer e remove transição para resposta imediata
			clearInterval(autoPlay);
			track.style.transition = 'none';

			animationID = requestAnimationFrame(animation);
		}

		function touchMove(event) {
			if (isDragging) {
				const currentPosition = getPositionX(event);
				const diff = currentPosition - startX;
				currentTranslate = prevTranslate + diff;
			}
		}

		function touchEnd() {
			isDragging = false;
			cancelAnimationFrame(animationID);

			const movedBy = currentTranslate - prevTranslate;
			const threshold = 50; // Mínimo px para considerar troca

			// Se moveu pouco, é clique. Se moveu muito, é drag.
			if (Math.abs(movedBy) > 5) isClickBlocked = true;
			else isClickBlocked = false;

			if (movedBy < -threshold) {
				goToSlide(currentIndex + 1);
			} else if (movedBy > threshold) {
				goToSlide(currentIndex - 1);
			} else {
				goToSlide(currentIndex);
			}

			resetInterval();
		}

		// Listeners
		track.addEventListener('touchstart', touchStart);
		track.addEventListener('touchmove', touchMove);
		track.addEventListener('touchend', touchEnd);

		track.addEventListener('mousedown', touchStart);
		track.addEventListener('mousemove', touchMove);
		track.addEventListener('mouseup', touchEnd);
		track.addEventListener('mouseleave', () => {
			if (isDragging) touchEnd();
		});

		// Prevenções Padrão
		track.oncontextmenu = (e) => { e.preventDefault(); return false; };

		// Evita Drag nativo de imagens que atrapalha o slide manual
		slides.forEach(slide => {
			const img = slide.tagName === 'IMG' ? slide : slide.querySelector('img');
			if (img) img.addEventListener('dragstart', e => e.preventDefault());
		});

		// Prevenir clique em links se foi um arrasto
		track.addEventListener('click', (e) => {
			if (isClickBlocked) {
				e.preventDefault();
				e.stopImmediatePropagation();
				isClickBlocked = false;
			}
		}, true); // Capture phase para interceptar antes

		// Responsividade
		window.addEventListener('resize', () => {
			goToSlide(currentIndex);
		});
	}

	/* --- 3. Inicializa os Carrosséis --- */
	// Carrossel de Novidades (4 segundos)
	setupCarousel('carousel-novidades', 4000);

	// Carrossel de Funcionalidades (5 segundos)
	setupCarousel('carousel-funcionalidades', 5000);

});