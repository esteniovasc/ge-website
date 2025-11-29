document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('validationForm');
    const inputCode = document.getElementById('docCode');
    
    // Áreas de Estado
    const searchState = document.getElementById('searchState');
    const resultState = document.getElementById('resultState');
    const feedbackArea = document.getElementById('feedbackArea');
    const btnNewSearch = document.getElementById('btnNewSearch');

    // --- 1. Máscara do Input (00-XXXX-XX-0000) ---
    inputCode.addEventListener('input', (e) => {
        let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Apenas letras e números
        
        // Aplica a máscara visual
        // Formato esperado: 2 chars - 4 chars - 2 chars - 4 chars
        if (v.length > 2) v = v.substring(0, 2) + '-' + v.substring(2);
        if (v.length > 7) v = v.substring(0, 7) + '-' + v.substring(7);
        if (v.length > 10) v = v.substring(0, 10) + '-' + v.substring(10);
        
        // Limita tamanho total (2+1+4+1+2+1+4 = 15 chars)
        if (v.length > 15) v = v.substring(0, 15);

        e.target.value = v;
    });

    // --- 2. Lógica de Validação (Simulação) ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const code = inputCode.value;

        // Simulação de Loading (opcional)
        const btn = form.querySelector('.btn-validate');
        const originalText = btn.innerText;
        btn.innerText = "Verificando...";
        btn.disabled = true;

        setTimeout(() => {
            // MOCK: Se terminar com "0000" é Sucesso, senão Erro.
            // No backend real, aqui seria o fetch()
            if (code.endsWith('0000') && code.length === 15) {
                showSuccess(code);
            } else {
                showError();
            }
            
            btn.innerText = originalText;
            btn.disabled = false;
        }, 800); // Delay falso de 800ms
    });

    // --- Funções de Troca de Estado ---

    function showSuccess(code) {
        // Atualiza Feedback Superior
        feedbackArea.innerHTML = `
            <span class="feedback-success">
                Resultado da busca: Documento encontrado 
                <span style="color: #fff; background: #3d7d32; border-radius: 4px; padding: 0 4px;">✔</span>
            </span>
        `;

        // Popula os dados (Simulação)
        document.getElementById('resHash').innerText = code;
        
        // Troca o Card
        searchState.style.display = 'none';
        resultState.style.display = 'block';
    }

    function showError() {
        // Atualiza Feedback Superior
        feedbackArea.innerHTML = `
            <div class="feedback-error">
                <span>Resultado da busca: Documento não encontrado ❌</span>
                <span style="font-weight: 400; font-size: 0.9rem; color: #000;">Tente novamente</span>
            </div>
        `;
        
        // Limpa input e foca
        inputCode.value = '';
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
        
        // Reseta texto original
        feedbackArea.innerHTML = `
            <span class="feedback-label">Escolha uma opção para conferir a veracidade da informação do documento recebido</span>
        `;
    });

});