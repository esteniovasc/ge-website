document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('validationForm');
    const inputCode = document.getElementById('docCode');

    // Áreas de Estado
    const searchState = document.getElementById('searchState');
    const resultState = document.getElementById('resultState');
    const feedbackArea = document.getElementById('feedbackArea');
    const btnNewSearch = document.getElementById('btnNewSearch');

    // Botões de Ação
    const btnVisualizar = document.getElementById('btnVisualizar');

    // --- 0. Inicialização (Query Param) ---
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('codigo');

    if (codeParam) {
        inputCode.value = codeParam;
        validateCode(codeParam);
    }

    // --- 1. Tratamento do Input (Flexível) ---
    inputCode.addEventListener('input', (e) => {
        // Permite letras, números e traços. Remove espaços.
        let v = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        e.target.value = v;
    });

    // --- 2. Lógica de Validação ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = inputCode.value.trim();

        if (!code) return;

        validateCode(code);
    });

    async function validateCode(code) {
        // 1. UI Loading
        const btn = form.querySelector('.btn-validate');
        const originalText = btn.innerText;
        btn.innerText = "Verificando...";
        btn.disabled = true;

        try {
            // 2. Chamada API
            const apiUrl = `${getUrl('API')}/public/documentos/validar?codigo=${code}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                // Se 404 ou outro erro
                throw new Error('Documento não encontrado');
            }

            const data = await response.json();

            // 3. Sucesso
            if (data.valid) {
               showSuccess(data);
            } else {
               showError(); 
            }

        } catch (error) {
            console.error(error);
            showError();
        } finally {
            // Reset UI
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }


    // --- Funções de Troca de Estado ---

    function showSuccess(data) {
        // Atualiza Feedback Superior
        feedbackArea.innerHTML = `
            <span class="feedback-success">
                Resultado da busca: Documento encontrado 
                <span style="color: #fff; background: #3d7d32; border-radius: 4px; padding: 0 4px;">✔</span>
            </span>
        `;

        // Popula os dados
        // Mapeamento de campos segura (caso algum venha nulo)
        document.getElementById('resTipo').innerText = data.tipo_documento || '-';
        
        // Formata data se existir
        if (data.emitido_em) {
            const dateObj = new Date(data.emitido_em);
            const dateStr = dateObj.toLocaleDateString('pt-BR');
            const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            document.getElementById('resEmissao').innerText = `${dateStr} às ${timeStr}`;
        } else {
            document.getElementById('resEmissao').innerText = '-';
        }
        
        // Validade (mock ou calculado se não vier do back)
        // Para este MVP vamos deixar fixo ou ocultar se não tiver essa info no JSON
        // document.getElementById('resValidade').innerText = ... (Backend não mandou no exemplo, mantendo estático ou limpando)
        document.getElementById('resValidade').innerText = "Válido"; // Default por enquanto

        // Iniciais do Aluno (Extrair do nome completo)
        if (data.aluno) {
            const initials = data.aluno.split(' ').map(n => n[0]).join('. ').toUpperCase();
            document.getElementById('resIniciais').innerText = initials;
            
            // Mascara CPF se vier
            // OBS: O JSON de exemplo não tinha CPF explicito além do aluno, mas se vier adicionamos
            // document.getElementById('resCpf').innerText = ...
        }

        document.getElementById('resEscola').innerText = data.escola || '-';
        document.getElementById('resHash').innerText = data.codigo || '-';

        // Configura Botão de Visualizar
        if (data.download_url) {
            btnVisualizar.style.display = 'inline-block';
            btnVisualizar.onclick = () => window.open(data.download_url, '_blank');
        } else {
            btnVisualizar.style.display = 'none';
        }

        // Troca o Card
        searchState.style.display = 'none';
        resultState.style.display = 'block';
    }

    function showError() {
        // Atualiza Feedback Superior
        feedbackArea.innerHTML = `
            <div class="feedback-error">
                <span>Resultado da busca: Documento não encontrado ❌</span>
                <span style="font-weight: 400; font-size: 0.9rem; color: #000;">Verifique o código e tente novamente</span>
            </div>
        `;
        
        // Limpa input e foca
        // inputCode.value = ''; // Opcional: manter o código errado para o usuário corrigir pode ser melhor
        inputCode.focus();
        
        // Garante que está no estado de busca
        searchState.style.display = 'block';
        resultState.style.display = 'none';
    }

    // Botão "Nova Consulta"
    btnNewSearch.addEventListener('click', () => {
        // Reseta tudo
        searchState.style.display = 'block';
        resultState.style.display = 'none';
        inputCode.value = '';
        
        // Limpa URL param sem recarregar
        window.history.pushState({}, document.title, window.location.pathname);

        // Reseta texto original
        feedbackArea.innerHTML = `
            <span class="feedback-label">Escolha uma opção para conferir a veracidade da informação do documento recebido</span>
        `;
    });

});