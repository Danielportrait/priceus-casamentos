document.addEventListener("DOMContentLoaded", function () {
  function validarCamposObrigatorios() {
    const nomeCliente = document.getElementById("nomeCliente").value.trim();
    const nomeNoivo = document.getElementById("nomeNoivo").value.trim();
    const email = document.getElementById("email").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const dataCasamento = document.getElementById("dataCasamento").value.trim();
    const cidade = document.getElementById("cidadeCasamento").value.trim().toLowerCase();
    const estado = document.getElementById("estadoCasamento").value.trim().toLowerCase();
    const pais = document.getElementById("paisCasamento").value.trim().toLowerCase();
    const horarioCasamento = document.getElementById("horarioCasamento").value.trim();
    const convidados = document.getElementById("convidados").value.trim();
    const outraCidade = document.getElementById("outraCidade").value.trim().toLowerCase();
    const outroPais = document.getElementById("outroPais").value.trim().toLowerCase();

    const camposPreenchidos = nomeCliente && nomeNoivo && email && whatsapp && dataCasamento && (cidade || outraCidade) && (estado || outroPais) && pais && horarioCasamento && convidados;

    const checkboxes = document.querySelectorAll('#servicosSelecionados input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.disabled = !camposPreenchidos;
    });

    const mensagemErro = document.getElementById("mensagemErro");
    if (!camposPreenchidos) {
      mensagemErro.style.display = "block";
      mensagemErro.textContent = "Por favor, preencha todos os campos obrigatórios corretamente.";
      
      // Destacar campos que não foram preenchidos corretamente
      document.querySelectorAll('#nomeCliente, #nomeNoivo, #email, #whatsapp, #dataCasamento, #cidadeCasamento, #estadoCasamento, #paisCasamento, #horarioCasamento, #convidados, #outraCidade, #outroPais').forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = "red";
        } else {
          input.style.borderColor = "";
        }
      });
    } else {
      mensagemErro.style.display = "none";
      document.querySelectorAll('#nomeCliente, #nomeNoivo, #email, #whatsapp, #dataCasamento, #cidadeCasamento, #estadoCasamento, #paisCasamento, #horarioCasamento, #convidados, #outraCidade, #outroPais').forEach(input => {
        input.style.borderColor = "";
      });
    }
  }

  // Função para buscar estados do IBGE
  function buscarEstados() {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => response.json())
      .then(data => {
        const estadoSelect = document.getElementById('estadoCasamento');
        data.forEach(estado => {
          const option = document.createElement('option');
          option.value = estado.sigla.toLowerCase();
          option.textContent = estado.nome;
          estadoSelect.appendChild(option);
        });
      })
      .catch(error => console.error('Erro ao buscar estados:', error));
  }

  // Função para buscar cidades do IBGE com base no estado selecionado
  function buscarCidades(estadoSigla) {
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios`)
      .then(response => response.json())
      .then(data => {
        const cidadeSelect = document.getElementById('cidadeCasamento');
        cidadeSelect.innerHTML = '<option value="">Selecione a cidade</option>'; // Limpar opções anteriores
        data.forEach(cidade => {
          const option = document.createElement('option');
          option.value = cidade.nome.toLowerCase();
          option.textContent = cidade.nome;
          cidadeSelect.appendChild(option);
        });
      })
      .catch(error => console.error('Erro ao buscar cidades:', error));
  }

  // Chamar a função para buscar estados ao carregar a página
  buscarEstados();

  // Adicionar evento de mudança para o campo de seleção de país
  document.getElementById('paisCasamento').addEventListener('change', function () {
    const pais = this.value;
    if (pais === 'brasil') {
      document.getElementById('estadoCasamento').style.display = 'block';
      document.getElementById('cidadeCasamento').style.display = 'block';
      document.getElementById('outroPais').style.display = 'none';
      document.getElementById('outraCidade').style.display = 'none';
    } else if (pais === 'outro') {
      document.getElementById('estadoCasamento').style.display = 'none';
      document.getElementById('cidadeCasamento').style.display = 'none';
      document.getElementById('outroPais').style.display = 'block';
      document.getElementById('outraCidade').style.display = 'block';
    } else {
      document.getElementById('estadoCasamento').style.display = 'none';
      document.getElementById('cidadeCasamento').style.display = 'none';
      document.getElementById('outroPais').style.display = 'none';
      document.getElementById('outraCidade').style.display = 'none';
    }
  });

  // Adicionar evento de mudança para o campo de seleção de estado
  document.getElementById('estadoCasamento').addEventListener('change', function () {
    const estadoSigla = this.value;
    if (estadoSigla) {
      buscarCidades(estadoSigla);
    } else {
      document.getElementById('cidadeCasamento').innerHTML = '<option value="">Selecione a cidade</option>';
    }
  });

  // Habilitar todos os checkboxes para testes
  document.querySelectorAll('#servicosSelecionados input[type="checkbox"]').forEach(checkbox => {
    checkbox.disabled = false;
  });

  window.calcularValorTotal = function calcularValorTotal() {
    const checkboxes = document.querySelectorAll('#servicosSelecionados input[type="checkbox"]:checked');
    let total = 0;

    checkboxes.forEach(checkbox => {
      total += parseFloat(checkbox.value);
    });

    let acrescimoPercentual = 0;

    // Aplicar acréscimos por quantidade de produtos
    if (checkboxes.length === 1) {
      acrescimoPercentual += 0.25; // Adicionar 25% se apenas um produto for selecionado
    } else {
      // Normalizar valores de cidade, estado e país
      const cidade = document.getElementById("cidadeCasamento").value.trim().toLowerCase();
      const estado = document.getElementById("estadoCasamento").value.trim().toLowerCase();
      const pais = document.getElementById("paisCasamento").value.trim().toLowerCase();
      const outraCidade = document.getElementById("outraCidade").value.trim().toLowerCase();
      const outroPais = document.getElementById("outroPais").value.trim().toLowerCase();

      const cidadesEspeciais = ["patrocínio", "patrocinio", "uberlandia", "patos de minas", "guimarania", "serra do salitre"];
      const estadosEspeciais = ["mg", "minas gerais"];
      const paisesEspeciais = ["brasil", "br", "brazil"];

      const cidadeNormalizada = cidadesEspeciais.includes(cidade) ? "patrocínio" : cidade;
      const estadoNormalizado = estadosEspeciais.includes(estado) ? "mg" : estado;
      const paisNormalizado = paisesEspeciais.includes(pais) ? "brasil" : pais;

      // Aplicar acréscimos por cidade, estado e país
      if (cidadeNormalizada === "uberlandia") {
        acrescimoPercentual += 0.25; // Adicionar 5% para Uberlândia
      } else if (cidadeNormalizada === "patos de minas") {
        acrescimoPercentual += 0.10; // Adicionar 7% para Patos de Minas
      } else if (cidadeNormalizada === "guimarania") {
        acrescimoPercentual += 0.00; // Adicionar 3% para Guimarânia
      } else if (cidadeNormalizada === "serra do salitre") {
        acrescimoPercentual += 0.10; // Adicionar 4% para Serra do Salitre
      } else if (cidadeNormalizada !== "patrocínio") {
        acrescimoPercentual += 0.20; // Adicionar 10% se a cidade não for Patrocínio
      }

      if (estadoNormalizado !== "mg") {
        acrescimoPercentual += 0.25; // Adicionar 15% se o estado não for MG
      }

      if (paisNormalizado !== "brasil") {
        acrescimoPercentual += 0.30; // Adicionar 20% se o país não for Brasil
      }

      if (outroPais) {
        acrescimoPercentual += 0.40; // Adicionar 20% se o país for diferente de Brasil
      }
    }

    let valorComAcrescimo = total * (1 + acrescimoPercentual);

    // Aplicar desconto de 10% para pagamento à vista
    const formaPagamento = document.getElementById("formaPagamento").value;
    if (formaPagamento === "avista") {
      valorComAcrescimo *= 0.90; // Aplicar 10% de desconto
      document.getElementById("pagamentoAvista").style.display = "block";
      document.getElementById("valorAvista").textContent = formatarMoeda(valorComAcrescimo);
    } else {
      document.getElementById("pagamentoAvista").style.display = "none";
    }

    // Atualizar o valor total final
    document.getElementById("valorTotalFinal").textContent = `TOTAL: ${formatarMoeda(valorComAcrescimo)}`;
    localStorage.setItem("valorTotal", valorComAcrescimo.toFixed(2));

    // Mostrar opções de pagamento específicas
    if (formaPagamento === "pix") {
      const entradaPix = valorComAcrescimo * 0.25;
      const parcelasPix = (valorComAcrescimo * 0.75) / 7;
      document.getElementById("pixEntrada").textContent = formatarMoeda(entradaPix);
      document.getElementById("pixParcelas").textContent = formatarMoeda(parcelasPix);
      document.getElementById("pagamentoPix").style.display = "block";
      document.getElementById("pagamentoCartao").style.display = "none";
    } else if (formaPagamento === "cartao") {
      let parcelasTexto = "";
      for (let i = 1; i <= 12; i++) {
        const valorParcela = (valorComAcrescimo * (1 + 0.035 * i)) / i;
        parcelasTexto += `${i}x de ${formatarMoeda(valorParcela)}<br>`;
      }
      document.getElementById("parcelasCartao").innerHTML = parcelasTexto;
      document.getElementById("pagamentoCartao").style.display = "block";
      document.getElementById("pagamentoPix").style.display = "none";
    } else {
      document.getElementById("pagamentoPix").style.display = "none";
      document.getElementById("pagamentoCartao").style.display = "none";
    }
  }

  window.formatarMoeda = function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  window.enviarWhatsApp = function enviarWhatsApp() {
    const nomeCliente = document.getElementById("nomeCliente").value;
    const nomeNoivo = document.getElementById("nomeNoivo").value;
    const email = document.getElementById("email").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const dataCasamento = document.getElementById("dataCasamento").value;
    const cidade = document.getElementById("cidadeCasamento").value || document.getElementById("outraCidade").value;
    const estado = document.getElementById("estadoCasamento").value || document.getElementById("outroPais").value;
    const totalPacote = document.getElementById("valorTotalFinal").textContent;
    const formaPagamento = document.getElementById("formaPagamento").value;

    const servicosSelecionados = Array.from(document.querySelectorAll('#servicosSelecionados input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.nextElementSibling.textContent.trim());

    const mensagem = `Olá, gostaria de compartilhar o orçamento para o casamento:

Cliente: ${nomeCliente}
Nome do(a) Noivo(a): ${nomeNoivo}
Email: ${email}
WhatsApp: ${whatsapp}
Data do Casamento: ${dataCasamento}
Local: ${cidade}, ${estado}

Serviços Selecionados: ${servicosSelecionados.join(', ')}

Forma de Pagamento: ${formaPagamento}

${totalPacote}

Aguardo retorno!`;

    const whatsappLink = `https://wa.me/5534999048840?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappLink, '_blank');
  }

  window.salvarPDF = function salvarPDF() {
    window.print();
  }

  document.getElementById("botaoWhatsApp").addEventListener("click", enviarWhatsApp);
  document.querySelectorAll('#servicosSelecionados input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', calcularValorTotal);
  });
  document.getElementById('formaPagamento').addEventListener('change', calcularValorTotal);


// Função para consumir a API e obter os dados normalizados
async function getNormalizedLocationData(apiUrl, parameters = {}) {
  try {
    const url = new URL(apiUrl);
    Object.keys(parameters).forEach((key) =>
      url.searchParams.append(key, parameters[key])
    );

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    const data = await response.json();

    const normalizedData = {
      cidade: data.cidade ? normalizeString(data.cidade) : null,
      estado: data.estado ? normalizeString(data.estado) : null,
      municipio: data.municipio ? normalizeString(data.municipio) : null,
    };

    return normalizedData;
  } catch (error) {
    console.error("Erro ao obter os dados de localização:", error.message);
    return null;
  }
}

// Função para normalizar strings
function normalizeString(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

// Função para validar os dados normalizados
function validateNormalizedData(data) {
  if (!data) return false;

  const { cidade, estado, municipio } = data;

  if (!cidade || !estado || !municipio) {
    console.error("Dados incompletos recebidos:", data);
    return false;
  }

  console.log("Validação bem-sucedida. Dados completos.");
  return true;
}

// Função para formatar valores com letras maiúsculas iniciais
function capitalize(value) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Função para inicializar e executar todo o fluxo
async function initialize() {
  const apiUrl = "https://api.exemplo.com/localizacao"; // URL fictícia da API
  const parameters = { cep: "01001000" }; // Exemplo de parâmetros

  console.log("Obtendo dados de localização...");
  const locationData = await getNormalizedLocationData(apiUrl, parameters);

  if (locationData) {
    console.log("Dados normalizados:", locationData);

    if (validateNormalizedData(locationData)) {
      console.log("Dados prontos para uso:");
      console.log(`Cidade: ${capitalize(locationData.cidade)}`);
      console.log(`Estado: ${capitalize(locationData.estado)}`);
      console.log(`Município: ${capitalize(locationData.municipio)}`);
    } else {
      console.error("Os dados recebidos são inválidos ou incompletos.");
    }
  } else {
    console.error("Não foi possível obter os dados da localização.");
  }
}

// Inicializa o fluxo ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  console.log("Script carregado e inicializado.");
  initialize();
});

// Chame a função de validação ao carregar a página para definir o estado inicial dos checkboxes
//validarCamposObrigatorios();
});