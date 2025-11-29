document.addEventListener('DOMContentLoaded', () => {
    
    const formCard = document.getElementById('formCard');
    const form = document.getElementById('cadastroForm');
    const selectEstado = document.getElementById('estado');
    const selectCidade = document.getElementById('cidade');

    // --- 1. Carregar Estados e Cidades (IBGE) ---
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
        .then(response => response.json())
        .then(estados => {
            estados.forEach(uf => {
                const option = document.createElement('option');
                option.value = uf.sigla;
                option.textContent = uf.sigla;
                selectEstado.appendChild(option);
            });
        })
        .catch(err => console.error('Erro ao carregar estados:', err));

    selectEstado.addEventListener('change', () => {
        const uf = selectEstado.value;
        if (!uf) return;

        selectCidade.innerHTML = '<option value="" disabled selected>Carregando...</option>';
        selectCidade.disabled = true;

        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
            .then(response => response.json())
            .then(cidades => {
                selectCidade.innerHTML = '<option value="" disabled selected>Escolha a cidade</option>';
                cidades.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.nome;
                    option.textContent = city.nome;
                    selectCidade.appendChild(option);
                });
                selectCidade.disabled = false;
            })
            .catch(err => {
                selectCidade.innerHTML = '<option value="">Erro</option>';
            });
    });

    // --- 2. Máscaras ---

    // Telefone
    document.getElementById('telefone').addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
        e.target.value = v;
    });

    // INEP (Apenas números)
    document.getElementById('inep').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // --- NOVO: Máscara e Validação de CNPJ Alfanumérico ---
    const inputCNPJ = document.getElementById('cnpj');

    inputCNPJ.addEventListener('input', (e) => {
        // Permite letras e números, força maiúsculas, remove outros caracteres
        let v = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        // Limita a 14 caracteres
        if (v.length > 14) v = v.substring(0, 14);

        // Aplica a máscara visual XX.XXX.XXX/XXXX-XX
        v = v.replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9])/, '$1.$2');
        v = v.replace(/^([a-zA-Z0-9]{2})\.([a-zA-Z0-9]{3})([a-zA-Z0-9])/, '$1.$2.$3');
        v = v.replace(/\.([a-zA-Z0-9]{3})([a-zA-Z0-9])/, '.$1/$2');
        v = v.replace(/([a-zA-Z0-9]{4})([a-zA-Z0-9])/, '$1-$2');

        e.target.value = v;
    });

    // Lógica de Validação CNPJ Alfanumérico (Tabela ASCII - 48)
    function validarCNPJAlfanumerico(cnpj) {
        // Remove pontuação
        const cleanCNPJ = cnpj.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        if (cleanCNPJ.length !== 14) return false;

        // Função para obter valor do caractere (0-9 = valor, A=17, B=18... Z=42)
        const getCharValue = (char) => {
            const code = char.charCodeAt(0);
            return code - 48; // '0' é 48 (48-48=0), 'A' é 65 (65-48=17)
        };

        // Função para calcular DV
        const calcularDV = (texto, pesos) => {
            let soma = 0;
            for (let i = 0; i < texto.length; i++) {
                soma += getCharValue(texto[i]) * pesos[i];
            }
            const resto = soma % 11;
            return (resto < 2) ? 0 : (11 - resto);
        };

        // DV1 (12 caracteres)
        const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const dv1 = calcularDV(cleanCNPJ.substring(0, 12), pesos1);

        if (dv1 !== parseInt(cleanCNPJ[12])) return false;

        // DV2 (13 caracteres)
        const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const dv2 = calcularDV(cleanCNPJ.substring(0, 13), pesos2);

        return dv2 === parseInt(cleanCNPJ[13]);
    }

    // --- 3. Envio do Formulário ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validação INEP
        const inep = document.getElementById('inep').value;
        if (inep.length !== 8) {
            alert("O código INEP deve ter exatamente 8 dígitos.");
            return;
        }

        // Validação CNPJ
        const cnpjValue = inputCNPJ.value;
        if (!validarCNPJAlfanumerico(cnpjValue)) {
            alert("CNPJ inválido (verifique os dígitos verificadores).");
            return;
        }

        // Entra no estado de Loading
        formCard.classList.remove('state-initial');
        formCard.classList.add('state-loading');

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Regra de Negócio: Duplicar e-mail
        data.email_contato_escola = data.email_solicitante;

        // Ajustar CNPJ para envio (opcional: mandar limpo ou formatado, aqui mandando limpo)
        // O back-end parece aceitar string, então mandamos formatado mesmo para legibilidade ou limpo se preferir.
        // Vamos mandar limpo para evitar problemas.
        data.cnpj = data.cnpj.replace(/[^a-zA-Z0-9]/g, ''); 

        try {
			
            const apiUrl = `${getUrl('API')}/solicitacoes-acesso`;

    		const response = await fetch(apiUrl, { 
        		method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok || response.status === 201) {
                formCard.classList.remove('state-loading');
                formCard.classList.add('state-success');
            } else {
                throw new Error('Erro na requisição');
            }

        } catch (error) {
            console.error(error);
            formCard.classList.remove('state-loading');
            formCard.classList.add('state-initial');
            alert("Houve um erro ao enviar sua solicitação. Tente novamente ou entre em contato.");
        }
    });

});