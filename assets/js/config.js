/* Configuração de Ambiente Automática */

// Detecta se está rodando localmente (arquivo ou localhost)
const isLocal = window.location.hostname === 'localhost' ||
	window.location.hostname === '127.0.0.1' ||
	window.location.protocol === 'file:';

const CONFIG = {
	// Se for local, usa DEV. Se não, usa PROD.
	CURRENT_ENV: isLocal ? 'DEV' : 'PROD',

	URLS: {
		DEV: {
			API: 'http://localhost:3333',
			// Links externos (abre em nova aba se for DEV)
			LOGIN: 'http://localhost:5173/login',

			// Links internos locais DEVEM ser apenas o nome do arquivo (SEM a barra / na frente)
			HOME: 'index.html',
			CADASTRO: 'cadastro.html',
			VALIDAR: 'validar-documentos.html',
			EM_BREVE: 'em-breve.html'
		},
		PROD: {
			API: 'http://localhost:3333', // (Substituir quando tiver o deploy do back)
			// Links externos
			LOGIN: 'https://app.gestaoescolar.tech/login',

			// Links internos produção (COM a barra / para URLs limpas)
			HOME: '/',
			CADASTRO: '/cadastro',
			VALIDAR: '/validar-documentos',
			EM_BREVE: '/em-breve'
		}
	}
};

// Função auxiliar para pegar a URL correta
function getUrl(key) {
	return CONFIG.URLS[CONFIG.CURRENT_ENV][key];
}