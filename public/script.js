document.addEventListener("DOMContentLoaded", function () {
  // Função para calcular o acréscimo por localização
  function calcularAcrescimoPorLocalizacao(cidade, estado) {
    let acrescimoPercentual = 0;
    if (estado === "Minas Gerais") {
      if (cidade === "Patrocínio" || cidade === "Guimarânia") {
        acrescimoPercentual = 0;
      } else if (cidade === "Uberlândia") {
        acrescimoPercentual = 0.15;
      } else if (cidade === "Patos de Minas") {
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
