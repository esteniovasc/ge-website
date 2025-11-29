/* Configuração de Ambiente
   Altere 'CURRENT_ENV' para 'DEV' ou 'PROD' para mudar o comportamento dos links.
*/

const CONFIG = {
    CURRENT_ENV: 'PROD', // 'DEV' = Links locais | 'PROD' = Links públicos/Em breve

    URLS: {
        DEV: {
            LOGIN: 'http://localhost:5173/login', // Seu front do App rodando local
            API: 'http://localhost:3333'          // Seu back rodando local
        },
        PROD: {
            LOGIN: 'em-breve.html',               // Página de "Em construção"
            API: 'http://localhost:3333'          // (Mesmo em Prod, manteremos local por enquanto conforme seu pedido, ou deixamos vazio para travar)
        }
    }
};

// Função auxiliar para pegar a URL correta
function getUrl(type) {
    return CONFIG.URLS[CONFIG.CURRENT_ENV][type];
}