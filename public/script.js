document.addEventListener("DOMContentLoaded", function () {
  // Função principal de validação de campos
  function validarCamposObrigatorios() {
    const campos = {
      nomeCliente: document.getElementById("nomeCliente").value.trim(),
      nomeNoivo: document.getElementById("nomeNoivo").value.trim(),
      email: document.getElementById("email").value.trim(),
      whatsapp: document.getElementById("whatsapp").value.trim(),
      dataCasamento: document.getElementById("dataCasamento").value.trim(),
      cidade: document.getElementById("cidadeCasamento").value.trim().toLowerCase(),
      estado: document.getElementById("estadoCasamento").value.trim().toLowerCase(),
      pais: document.getElementById("paisCasamento").value.trim().toLowerCase(),
      horario: document.getElementById("horarioCasamento").value.trim(),
      convidados: document.getElementById("convidados").value.trim(),
      outraCidade: document.getElementById("outraCidade").value.trim().toLowerCase(),
      outroPais: document.getElementById("outroPais").value.trim().toLowerCase()
    };

    const todosPreenchidos = campos.nomeCliente && campos.nomeNoivo && campos.email &&
      campos.whatsapp && campos.dataCasamento && (campos.cidade || campos.outraCidade) &&
      (campos.estado || campos.outroPais) && campos.pais && campos.horario && campos.convidados;

    // Controle dos checkboxes
    document.querySelectorAll('#servicosSelecionados input[type="checkbox"]').forEach(checkbox => {
      checkbox.disabled = !todosPreenchidos;
    });

    // Controle de mensagens de erro
    const mensagemErro = document.getElementById("mensagemErro");
    mensagemErro.style.display = todosPreenchidos ? "none" : "block";
    mensagemErro.textContent = "Por favor, preencha todos os campos obrigatórios corretamente.";

    // Destacar campos inválidos
    document.querySelectorAll('input, select').forEach(input => {
      input.style.borderColor = input.value.trim() ? "" : "red";
    });
  }

  // Funções para busca de localidades
  async function buscarEstados() {
    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const estados = await response.json();
      const select = document.getElementById('estadoCasamento');
      
      estados.forEach(estado => {
        const option = new Option(estado.nome, estado.sigla.toLowerCase());
        select.add(option);
      });
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
    }
  }

  async function buscarCidades(uf) {
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const cidades = await response.json();
      const select = document.getElementById('cidadeCasamento');
      
      select.innerHTML = '<option value="">Selecione a cidade</option>';
      cidades.forEach(cidade => {
        const option = new Option(cidade.nome, cidade.nome.toLowerCase());
        select.add(option);
      });
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  }

  // Controles de país/seleção de localidade
  document.getElementById('paisCasamento').addEventListener('change', function() {
    const pais = this.value;
    const isBrasil = pais === 'brasil';
    
    document.getElementById('estadoCasamento').style.display = isBrasil ? 'block' : 'none';
    document.getElementById('cidadeCasamento').style.display = isBrasil ? 'block' : 'none';
    document.getElementById('outroPais').style.display = pais === 'outro' ? 'block' : 'none';
    document.getElementById('outraCidade').style.display = pais === 'outro' ? 'block' : 'none';
  });

  document.getElementById('estadoCasamento').addEventListener('change', function() {
    if(this.value) buscarCidades(this.value);
  });

  // Sistema de cálculos
  window.calcularValorTotal = function() {
    const descontos = {
      "patrocínio": 0.0,
      "patos de minas": 0.0,
      "guimarania": 0.0,
      "serra do salitre": 0.0,
    };
  
    const valores = {
      total: Array.from(document.querySelectorAll('#servicosSelecionados input[type="checkbox"]:checked'))
        .reduce((acc, checkbox) => acc + parseFloat(checkbox.value), 0),
      cidade: document.getElementById("cidadeCasamento").value.trim().toLowerCase() || 
             document.getElementById("outraCidade").value.trim().toLowerCase(),
      pais: document.getElementById("paisCasamento").value.trim().toLowerCase()
    };
  
    // Etapa 1: Aplicar desconto da cidade
    let desconto = descontos[valores.cidade] || 0;
    let valorComDesconto = valores.total * (1 - desconto);
  
    // Etapa 2: Aplicar acréscimo de país
    let acrescimo = valores.pais !== "brasil" ? 0.50 : 0;
    let valorComAcrescimo = valorComDesconto * (1 + acrescimo);
  
    // Etapa 3: Aplicar desconto à vista (se aplicável)
    const formaPagamento = document.getElementById("formaPagamento").value;
    let valorFinal = formaPagamento === "avista" 
      ? valorComAcrescimo * 0.90 
      : valorComAcrescimo;
  
    // Atualizar interface
    document.getElementById("valorTotalFinal").textContent = `TOTAL: ${formatarMoeda(valorFinal)}`;
    document.getElementById("valorAvista").textContent = formatarMoeda(valorFinal);
    
    
    // Atualizar parcelamentos
    if(formaPagamento === "pix") {
      document.getElementById("pixEntrada").textContent = formatarMoeda(valorFinal * 0.25);
      document.getElementById("pixParcelas").textContent = formatarMoeda((valorFinal * 0.75) / 7);
    }
    
    if(formaPagamento === "cartao") {
      document.getElementById("parcelasCartao").innerHTML = 
        Array.from({length: 12}, (_, i) => 
          `${i+1}x de ${formatarMoeda((valorFinal * (1 + 0.035 * (i+1))) / (i+1))}<br>`
        ).join('');
    }

    // Exibir seções corretas
    document.querySelectorAll('.pagamento-opcao').forEach(el => el.style.display = 'none');
    if(formaPagamento) document.getElementById(`pagamento${formaPagamento.charAt(0).toUpperCase() + formaPagamento.slice(1)}`).style.display = 'block';
  };

  // Funções auxiliares
  window.formatarMoeda = valor => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  window.enviarWhatsApp = () => {
  const dados = {
    nome: document.getElementById("nomeCliente").value || "Não informado",
    noivo: document.getElementById("nomeNoivo").value || "Não informado",
    email: document.getElementById("email").value || "Não informado",
    whatsapp: document.getElementById("whatsapp").value || "Não informado",
    data: (() => {
      const dataOriginal = document.getElementById("dataCasamento").value;
      return dataOriginal 
        ? dataOriginal.split('-').reverse().join('/') // Formatação direta
        : "Não informado";
    })(),
    cidade: document.getElementById("cidadeCasamento").value || document.getElementById("outraCidade").value || "Não informado",
    estado: document.getElementById("estadoCasamento").value || document.getElementById("outroPais").value || "Não informado",
    servicos: Array.from(document.querySelectorAll('#servicosSelecionados input[type="checkbox"]:checked'))
               .map(checkbox => checkbox.nextElementSibling.textContent.trim()),
    pagamento: document.getElementById("formaPagamento").value || "Não especificada",
    total: document.getElementById("valorTotalFinal").textContent || "Não informado"
  };

  const mensagem = `👋 Olá, tudo bem? Gostaria de compartilhar o orçamento para o casamento:

🧑‍🤝‍🧑 *Cliente*: ${dados.nome}
💍 *Nome do(a) Noivo(a)*: ${dados.noivo}
📧 *Email*: ${dados.email}
📱 *WhatsApp*: ${dados.whatsapp}
📅 *Data do Casamento*: ${dados.data}
📍 *Local*: ${dados.cidade}, ${dados.estado}

✨ *Serviços Selecionados*: 
${dados.servicos.map(servico => `- ${servico}`).join('\n')}

💳 *Forma de Pagamento*: ${dados.pagamento}

💵 *Total do Pacote*: ${dados.total}

🚀 Aguardo seu retorno! 😊`;

  window.open(`https://wa.me/5534999048840?text=${encodeURIComponent(mensagem)}`);
};

  window.salvarPDF = () => window.print();

  // Event listeners
  document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('input', validarCamposObrigatorios);
  });

  document.getElementById("botaoWhatsApp").addEventListener("click", enviarWhatsApp);
  document.querySelectorAll('#servicosSelecionados input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', calcularValorTotal);
  });
  document.getElementById('formaPagamento').addEventListener('change', calcularValorTotal);

  // Inicialização
  buscarEstados();
  //validarCamposObrigatorios();
});
