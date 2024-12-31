document.addEventListener("DOMContentLoaded", function () {
  function validarCamposObrigatorios() {
    const nomeCliente = document.getElementById("nomeCliente").value.trim();
    const nomeNoivo = document.getElementById("nomeNoivo").value.trim();
    const email = document.getElementById("email").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const dataCasamento = document.getElementById("dataCasamento").value.trim();
    const cidade = document.getElementById("cidadeCasamento").value.trim();
    const estado = document.getElementById("estadoCasamento").value.trim();
    const pais = document.getElementById("paisCasamento").value.trim();
    const horarioCasamento = document.getElementById("horarioCasamento").value.trim();
    const convidados = document.getElementById("convidados").value.trim();

    const camposPreenchidos = nomeCliente && nomeNoivo && email && whatsapp && dataCasamento && cidade && estado && pais && horarioCasamento && convidados;

    const checkboxes = document.querySelectorAll('#servicosSelecionados input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.disabled = !camposPreenchidos;
    });

    const mensagemErro = document.getElementById("mensagemErro");
    if (!camposPreenchidos) {
      mensagemErro.style.display = "block";
      mensagemErro.textContent = "Por favor, preencha todos os campos obrigatórios corretamente.";
      
      // Destacar campos que não foram preenchidos corretamente
      document.querySelectorAll('#nomeCliente, #nomeNoivo, #email, #whatsapp, #dataCasamento, #cidadeCasamento, #estadoCasamento, #paisCasamento, #horarioCasamento, #convidados').forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = "red";
        } else {
          input.style.borderColor = "";
        }
      });
    } else {
      mensagemErro.style.display = "none";
      document.querySelectorAll('#nomeCliente, #nomeNoivo, #email, #whatsapp, #dataCasamento, #cidadeCasamento, #estadoCasamento, #paisCasamento, #horarioCasamento, #convidados').forEach(input => {
        input.style.borderColor = "";
      });
    }
  }

  document.querySelectorAll('#nomeCliente, #nomeNoivo, #email, #whatsapp, #dataCasamento, #cidadeCasamento, #estadoCasamento, #paisCasamento, #horarioCasamento, #convidados').forEach(input => {
    input.addEventListener('input', validarCamposObrigatorios);
  });

  window.calcularParcelamento = function calcularParcelamento() {
    const checkboxes = document.querySelectorAll('#servicosSelecionados input[type="checkbox"]');
    let total = 0;
    let adicionarAcrescimoItem = false;
  
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        total += parseFloat(checkbox.value);
  
        // Verificar itens específicos para aplicar acréscimo de 30%
        if (
          checkbox.nextElementSibling.textContent.includes("Cobertura completa do casamento ao ar livre") ||
          checkbox.nextElementSibling.textContent.includes("Cobertura completa do casamento na igreja")
        ) {
          adicionarAcrescimoItem = true;
        }
      }
    });
  
    const cidade = document.getElementById("cidadeCasamento").value.trim().toLowerCase();
    const estado = document.getElementById("estadoCasamento").value.trim().toUpperCase();
    const pais = document.getElementById("paisCasamento").value.trim().toLowerCase();
    const dataCasamento = document.getElementById("dataCasamento").value.trim();
  
    const estadosBrasil = {
      "AC": "ACRE", "AL": "ALAGOAS", "AP": "AMAPÁ", "AM": "AMAZONAS", "BA": "BAHIA",
      "CE": "CEARÁ", "DF": "DISTRITO FEDERAL", "ES": "ESPÍRITO SANTO", "GO": "GOIÁS", "MA": "MARANHÃO",
      "MT": "MATO GROSSO", "MS": "MATO GROSSO DO SUL", "MG": "MINAS GERAIS", "PA": "PARÁ", "PB": "PARAÍBA",
      "PR": "PARANÁ", "PE": "PERNAMBUCO", "PI": "PIAUÍ", "RJ": "RIO DE JANEIRO", "RN": "RIO GRANDE DO NORTE",
      "RS": "RIO GRANDE DO SUL", "RO": "RONDÔNIA", "RR": "RORAIMA", "SC": "SANTA CATARINA", "SP": "SÃO PAULO",
      "SE": "SERGIPE", "TO": "TOCANTINS"
    };
  
    let acrescimoPercentual = 0.30;
  
    // Verificar país e estado
    if (pais === "brasil") {
      const estadoNormalizado = estadosBrasil[estado] || Object.values(estadosBrasil).find(e => e.toUpperCase() === estado);
      if (estadoNormalizado === "MINAS GERAIS") {
        if (cidade === "patrocínio" || cidade === "guimarânia") {
          acrescimoPercentual = 0;
        } else if (cidade === "uberlândia") {
          acrescimoPercentual = 0.30;
        } else if (cidade === "patos de minas") {
          acrescimoPercentual = 0.1;
        } else {
        acrescimoPercentual = 0.2;
      }
    } else {
      acrescimoPercentual = 0.3;
    }
    return acrescimoPercentual;
  }

  // Função para mostrar detalhes do parcelamento para Pix
  function mostrarParcelamentoPix(valorComAcrescimo) {
    const entradaPix = valorComAcrescimo * 0.25;
    const restantePix = valorComAcrescimo * 0.75;
    const parcelasPix = 7;
    const valorParcelaPix = restantePix / parcelasPix;

    document.getElementById("pixEntrada").textContent = entradaPix.toFixed(2);
    document.getElementById("pixParcelas").textContent = parcelasPix;
    document.getElementById("valorParcelaPix").textContent = valorParcelaPix.toFixed(2);
  }

  // Função para mostrar o parcelamento com juros para pagamento com cartão
  function mostrarParcelasComJuros(valorTotal) {
    const taxaJurosMensal = 0.035;
    const taxaAdministrativa = 0.02;
    const valorComTaxa = valorTotal * (1 + taxaAdministrativa);
    let resultadoParcelas = "";

    for (let i = 1; i <= 12; i++) {
      const valorParcela = (valorComTaxa * Math.pow(1 + taxaJurosMensal, i)) / i;
      resultadoParcelas += `${i}x de R$ ${valorParcela.toFixed(2)}\n`;
    }

    document.getElementById("totalCartao").textContent = valorComTaxa.toFixed(2);
    document.getElementById("parcelamentoCartao").textContent = resultadoParcelas;
  }

  // Função para mostrar a opção de pagamento selecionada
  function mostrarOpcaoPagamento() {
    document.getElementById("pagamentoPix").style.display = "none";
    document.getElementById("pagamentoCartao").style.display = "none";

    const pagamentoEscolhido = document.getElementById("formaPagamento").value;
    if (pagamentoEscolhido === "pix") {
      document.getElementById("pagamentoPix").style.display = "block";
    } else if (pagamentoEscolhido === "cartao") {
      document.getElementById("pagamentoCartao").style.display = "block";
    }
  }

  // Função para calcular o valor total com o acréscimo por localização
  function calcularParcelamento() {
    const checkboxes = document.querySelectorAll('#servicosSelecionados input[type="checkbox"]');
    let total = 0;

    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        total += parseFloat(checkbox.value);
      }
    });

    const cidade = document.getElementById("cidadeCasamento").value;
    const estado = document.getElementById("estadoCasamento").value;
    const acrescimoPercentual = calcularAcrescimoPorLocalizacao(cidade, estado);
    const valorComAcrescimo = total * (1 + acrescimoPercentual);

    document.getElementById("valorTotalFinal").textContent = `Valor total do pacote personalizado: R$ ${valorComAcrescimo.toFixed(2)}`;
    localStorage.setItem("valorTotal", valorComAcrescimo.toFixed(2));

    const formaPagamento = document.getElementById("formaPagamento").value;
    if (formaPagamento === "pix") {
      mostrarParcelamentoPix(valorComAcrescimo);
    } else if (formaPagamento === "cartao") {
      mostrarParcelasComJuros(valorComAcrescimo);
    }
  }

  // Função para enviar dados via WhatsApp
  function enviarWhatsApp() {
    const nomeCliente = document.getElementById("nomeCliente").value;
    const nomeNoivo = document.getElementById("nomeNoivo").value;
    const dataCasamento = document.getElementById("dataCasamento").value;
    const cidade = document.getElementById("cidadeCasamento").value;
    const estado = document.getElementById("estadoCasamento").value;
    const totalPacote = document.getElementById("valorTotalFinal").textContent;
  
    const servicosSelecionados = Array.from(document.querySelectorAll('#servicosSelecionados input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.nextElementSibling.textContent.trim());
  
    const formaPagamentoElem = document.getElementById("formaPagamento");
    const pagamentoEscolhido = formaPagamentoElem ? formaPagamentoElem.value : 'Não selecionado';
  
    const mensagem = `Olá, gostaria de compartilhar o orçamento para o casamento:\n\n` +
      `Cliente: ${nomeCliente}\n` +
      `Nome do(a) Noivo(a): ${nomeNoivo}\n` +
      `Data do Casamento: ${dataCasamento}\n` +
      `Local: ${cidade}, ${estado}\n\n` +
      `Serviços Selecionados: ${servicosSelecionados.join(', ')}\n\n` +
      `Forma de Pagamento: ${pagamentoEscolhido}\n` +
      `${totalPacote}\n\n` +
      `Aguardo retorno!`;
  
    const whatsappLink = `https://wa.me/5534999048840?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappLink, '_blank');
  }
  
  // Função para salvar a página em PDF
  function salvarPDF() {
    const elementoParaImpressao = document.getElementById("orcamentoContainer");
    html2pdf().from(elementoParaImpressao).save();
  }

  // Eventos
  document.querySelectorAll('#servicosSelecionados input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', calcularParcelamento);
  });
  document.getElementById('formaPagamento').addEventListener('change', mostrarOpcaoPagamento);
});