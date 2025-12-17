document.addEventListener('DOMContentLoaded', () => {

	const formCard = document.getElementById('formCard');
	const form = document.getElementById('cadastroForm');
	const selectEstado = document.getElementById('estado');
	const selectCidade = document.getElementById('cidade');
	const btnAutoFill = document.getElementById('btnAutoFill');

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

	// Refatorei a lógica de carregar cidades para uma função reutilizável (promessa)
	function carregarCidades(uf) {
		return new Promise((resolve, reject) => {
			if (!uf) return resolve();

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
					resolve();
				})
				.catch(err => {
					selectCidade.innerHTML = '<option value="">Erro</option>';
					reject(err);
				});
		});
	}

	selectEstado.addEventListener('change', () => {
		carregarCidades(selectEstado.value);
	});

	// --- 2. Máscaras ---

	// Telefone
	document.getElementById('telefone').addEventListener('input', (e) => {
		let v = e.target.value.replace(/\D/g, '');
		v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
		v = v.replace(/(\d)(\d{4})$/, '$1-$2');
		e.target.value = v;
		removeError(e.target); // Limpa erro ao digitar
	});

	// INEP (Apenas números)
	document.getElementById('inep').addEventListener('input', (e) => {
		e.target.value = e.target.value.replace(/\D/g, '');
		removeError(e.target);
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
		removeError(e.target);
	});

	// Remove erro genérico ao digitar em qualquer campo required
	form.querySelectorAll('[required]').forEach(input => {
		input.addEventListener('input', () => removeError(input));
		input.addEventListener('change', () => removeError(input)); // Para selects

		// NOVO: Escuta o evento 'invalid' do navegador para aplicar o estilo vermelho
		input.addEventListener('invalid', (e) => {
			e.target.classList.add('input-error');
		});
	});

	function removeError(input) {
		if (input.classList.contains('input-error')) {
			input.classList.remove('input-error');
		}
	}


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

	// --- 3. Auto-Fill Logic (Botão Mágico ✨) ---
	if (btnAutoFill) {
		btnAutoFill.addEventListener('click', async () => {
			// Dados Fakes Válidos
			const cargos = ["Diretor(a)"];
			const tipos = ["Privada", "Publica"];
			const faixas = ["Até 50 alunos", "51 a 150 alunos", "151 a 300 alunos"];
			const desafios = ["Melhorar a comunicação", "Organizar secretaria", "Reduzir inadimplência"];

			// Random Helpers
			const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
			const randNum = (digits) => Math.floor(Math.random() * Math.pow(10, digits)).toString().padStart(digits, '0');

			// 1. Cargo
			document.getElementById('cargo').value = rand(cargos);
			removeError(document.getElementById('cargo'));

			// 2. Escola
			document.getElementById('nome_escola').value = "Escola Modelo " + randNum(3);
			removeError(document.getElementById('nome_escola'));

			// 3. INEP (8 digitos)
			document.getElementById('inep').value = randNum(8);
			removeError(document.getElementById('inep'));

			// 4. CNPJ (Fake que passa na regex básica, mas o validador espera DV correto?) 
			// O validador original valida DV real. Vamos usar um gerador simples de CNPJ válido numérico para garantir.
			document.getElementById('cnpj').value = gerarCNPJValidoFormatado();
			removeError(document.getElementById('cnpj'));

			// 5. Faixa e Tipo
			document.getElementById('faixa_alunos').value = rand(faixas);
			removeError(document.getElementById('faixa_alunos'));

			document.getElementById('tipo_escola').value = rand(tipos);
			removeError(document.getElementById('tipo_escola'));

			// 6. Indicação e Desafio
			document.getElementById('indicacao').value = "IND-" + randNum(4);
			document.getElementById('desafio').value = rand(desafios);

			// 7. Estado e Cidade (Async)
			// Seleciona um estado aleatório (vamos pegar do select já carregado se possível)
			const optionsUF = selectEstado.querySelectorAll('option:not([disabled])');
			if (optionsUF.length > 0) {
				const randomUF = optionsUF[Math.floor(Math.random() * optionsUF.length)].value;
				selectEstado.value = randomUF;
				removeError(selectEstado);

				// Carrega cidades e seleciona uma
				await carregarCidades(randomUF);
				const optionsCity = selectCidade.querySelectorAll('option:not([disabled])');
				if (optionsCity.length > 0) {
					selectCidade.value = optionsCity[Math.floor(Math.random() * optionsCity.length)].value;
					removeError(selectCidade);
				}
			}
		});
	}

	function gerarCNPJValidoFormatado() {
		// Gerador simples de CNPJ numérico válido
		const n = 9;
		const n1 = Math.floor(Math.random() * n);
		const n2 = Math.floor(Math.random() * n);
		const n3 = Math.floor(Math.random() * n);
		const n4 = Math.floor(Math.random() * n);
		const n5 = Math.floor(Math.random() * n);
		const n6 = Math.floor(Math.random() * n);
		const n7 = Math.floor(Math.random() * n);
		const n8 = Math.floor(Math.random() * n);
		const n9 = 0; // Matriz
		const n10 = 0;
		const n11 = 0;
		const n12 = 1;

		let d1 = n12 * 2 + n11 * 3 + n10 * 4 + n9 * 5 + n8 * 6 + n7 * 7 + n6 * 8 + n5 * 9 + n4 * 2 + n3 * 3 + n2 * 4 + n1 * 5;
		d1 = 11 - (d1 % 11);
		if (d1 >= 10) d1 = 0;

		let d2 = d1 * 2 + n12 * 3 + n11 * 4 + n10 * 5 + n9 * 6 + n8 * 7 + n7 * 8 + n6 * 9 + n5 * 2 + n4 * 3 + n3 * 4 + n2 * 5 + n1 * 6;
		d2 = 11 - (d2 % 11);
		if (d2 >= 10) d2 = 0;

		return `${n1}${n2}.${n3}${n4}${n5}.${n6}${n7}${n8}/${n9}${n10}${n11}${n12}-${d1}${d2}`;
	}


	// --- 3. Envio do Formulário Com Validação Extra ---
	form.addEventListener('submit', async (e) => {
		// Validação Visual de Campos Vazios
		let hasError = false;
		const inputs = form.querySelectorAll('[required]');

		inputs.forEach(input => {
			if (!input.value.trim()) {
				input.classList.add('input-error');
				hasError = true;
			} else {
				input.classList.remove('input-error');
			}
		});

		// Se houver campos vazios, impede envio e foca no primeiro erro
		if (hasError) {
			e.preventDefault();
			const firstError = form.querySelector('.input-error');
			if (firstError) firstError.focus();
			return; // Interrompe aqui
		}

		// Continua com a validação lógica original (INEP, CNPJ, etc)
		// ...

		// PreventDefault já foi chamado se houve erro. Se chegou aqui, é um submit "real" inicial.
		// Mas como temos lógica async abaixo e e.preventDefault() lá embaixo, vamos re-estruturar.
		// O event listener original era async e fazia preventDefault no inicio.
		// Vamos manter o preventDefault SEMPRE no inicio para controlar o fluxo via JS.
		e.preventDefault();

		// Validação INEP
		const inep = document.getElementById('inep').value;
		if (inep.length !== 8) {
			alert("O código INEP deve ter exatamente 8 dígitos.");
			document.getElementById('inep').classList.add('input-error');
			return;
		}

		// Validação CNPJ
		const cnpjValue = inputCNPJ.value;
		if (!validarCNPJAlfanumerico(cnpjValue)) {
			alert("CNPJ inválido (verifique os dígitos verificadores).");
			inputCNPJ.classList.add('input-error');
			return;
		}

		// Entra no estado de Loading
		formCard.classList.remove('state-initial');
		formCard.classList.add('state-loading');

		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		// Regra de Negócio: Duplicar e-mail
		data.email_contato_escola = data.email_solicitante;

		// Ajustar CNPJ para envio
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