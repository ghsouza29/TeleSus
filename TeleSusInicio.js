
const $ = (id) => document.getElementById(id);

const CHAVE_SESSAO = "TeleSusSessao";

// RECUPERAR SESSÃO DO LOGIN
function obterSessao() {
  const dados =
    sessionStorage.getItem(CHAVE_SESSAO) ||
    localStorage.getItem(CHAVE_SESSAO);

  if (!dados) {
    return null;
  }

  try {
    return JSON.parse(dados);
  } catch {
    return null;
  }
}

const sessao = obterSessao();

// DADOS DO PACIENTE
// Nome e demais informações serão integrados
// ao cadastro futuramente.
const paciente = {
  nome: sessao?.nome || "Paciente",
  cpf: sessao?.cpf || "",
  ubs: sessao?.ubs || "Não informada",
  cartaoSus: sessao?.cartaoSus || "Não informado"
};

// INICIALIZAR
function inicializar() {
  if (!sessao || !sessao.cpf) {
    window.location.replace("index.html");
    return;
  }

  const primeiroNome = paciente.nome.split(" ")[0];

  $("nomeBoasVindas").textContent = primeiroNome;
  $("nomePerfil").textContent = paciente.nome;
  $("ubsUsuario").textContent = paciente.ubs;
  $("cartaoSus").textContent = paciente.cartaoSus;

  configurarEventos();
  atualizarResumoInicio();
}

const paginas = {
  inicio: {
    titulo: "Início",
    descricao: ""
  },

  informacoes: {
    titulo: "Suas informações",
    descricao: "Consulte seus dados pessoais e de contato."
  },

  "meus-agendamentos": {
    titulo: "Meus agendamentos",
    descricao: "Consulte seus atendimentos e horários."
  },

  agendamento: {
    titulo: "Agendamento",
    descricao: "Solicite um novo atendimento."
  },

  emergencia: {
    titulo: "Emergência",
    descricao: "Orientações para situações de urgência."
  },

  hospitais: {
    titulo: "Hospitais perto",
    descricao: "Encontre unidades de saúde próximas."
  }
};

// NAVEGAÇÃO
function navegar(pagina) {
  if (!paginas[pagina]) {
    return;
  }

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle(
      "active",
      item.dataset.page === pagina
    );
  });

  if (pagina === "inicio") {
    $("paginaInicio").hidden = false;
    $("paginaSecundaria").hidden = true;
    atualizarResumoInicio();
  } else {
    $("paginaInicio").hidden = true;
    $("paginaSecundaria").hidden = false;

    $("tituloPagina").textContent = paginas[pagina].titulo;
    $("descricaoPagina").textContent = paginas[pagina].descricao;

    carregarConteudo(pagina);
  }

  $("sidebar").classList.remove("open");
  window.scrollTo(0, 0);
}

// CONTEÚDO DAS SEÇÕES
function carregarConteudo(pagina) {
  const area = $("conteudoPagina");
  area.replaceChildren();

  if (pagina === "informacoes") {
    carregarPerfil(area);
    return;
  }

  if (pagina === "meus-agendamentos") {
    carregarMeusAgendamentos(area);
    return;
  }

  // PÁGINA DE AGENDAMENTO
  if (pagina === "agendamento") {
    carregarPreTriagem(area);
    return;
  }

  
if (pagina === "emergencia") {
  area.innerHTML = `
    <div class="emergencia-container">
      <div class="emergencia-card" role="region" aria-labelledby="tituloEmergencia">

        <div class="emergencia-icone" aria-hidden="true">!</div>

        <h2 id="tituloEmergencia">Precisa de atendimento imediato?</h2>

        <p>
          Em situações graves, como dificuldade intensa para respirar,
          dor forte no peito ou sinais de AVC, procure atendimento
          de emergência imediatamente.
        </p>

        <div class="emergencia-contato">
          <span>SAMU — Serviço de Atendimento Móvel de Urgência</span>
          <strong>192</strong>
          <span>Ligação gratuita</span>
        </div>

        <a href="tel:192" class="emergencia-botao">
          Ligar para o SAMU
        </a>

        <p class="emergencia-aviso">
          O TeleSus não realiza atendimento emergencial.
          Não aguarde uma consulta virtual ou a finalização
          da pré-triagem em situações graves.
        </p>

      </div>
    </div>
  `;
  return;
}

 if (pagina === "hospitais") {
  carregarHospitaisPerto(area);
  return;
}

}
function adicionarInformacao(elemento, rotulo, valor) {
  const paragrafo = document.createElement("p");
  const destaque = document.createElement("strong");

  destaque.textContent = rotulo + ": ";
  paragrafo.append(destaque, document.createTextNode(valor));

  elemento.appendChild(paragrafo);
}

function adicionarTexto(elemento, mensagem) {
  const paragrafo = document.createElement("p");
  paragrafo.textContent = mensagem;
  elemento.appendChild(paragrafo);
}

// MODAL
function mostrarModal(titulo, mensagem) {
  $("modalTitle").textContent = titulo;
  $("modalMessage").textContent = mensagem;
  $("modal").hidden = false;
  $("modalOk").focus();
}

function fecharModal() {
  $("modal").hidden = true;
}

// EVENTOS
function configurarEventos() {

  // MENU E CARTÕES
  document.querySelectorAll("[data-page]").forEach((botao) => {
    botao.addEventListener("click", () => {
      navegar(botao.dataset.page);
    });
  });

  $("voltarInicio").addEventListener("click", () => {
    navegar("inicio");
  });

  // MENU MOBILE
  $("menuToggle").addEventListener("click", () => {
    $("sidebar").classList.toggle("open");
  });

  // ENTRAR NA CONSULTA
  $("entrarConsulta").addEventListener("click", () => {
    mostrarModal(
      "Sala virtual",
      "Nenhuma sala virtual está disponível. A funcionalidade de teleconsulta será integrada futuramente."
    );
  });

  // CONTRASTE
  $("contrastButton").addEventListener("click", () => {
    document.body.classList.toggle("high-contrast");
  });

  // AJUSTE DE FONTE
  let tamanhoFonte = 100;

  $("fontButton").addEventListener("click", () => {
    tamanhoFonte += 10;

    if (tamanhoFonte > 130) {
      tamanhoFonte = 100;
    }

    document.documentElement.style.fontSize =
      tamanhoFonte + "%";
  });

  // VLIBRAS
  $("librasButton").addEventListener("click", () => {
    mostrarModal(
      "VLibras",
      "A integração com a ferramenta VLibras ainda não está disponível."
    );
  });

  // SAIR
  $("logoutButton").addEventListener("click", () => {
    localStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_SESSAO);

    window.location.replace("index.html");
  });

  // MODAL
  $("modalClose").addEventListener("click", fecharModal);
  $("modalOk").addEventListener("click", fecharModal);

  $("modal").addEventListener("click", (evento) => {
    if (evento.target === $("modal")) {
      fecharModal();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      fecharModal();
      $("sidebar").classList.remove("open");
    }
  });
}

// A inicialização ocorre ao final do arquivo, após as constantes.

// =====================================
// PERFIL DO PACIENTE - TELESUS
// =====================================

const CHAVE_PERFIL =
  "TeleSusPerfil_" + paciente.cpf.replace(/\D/g, "");

const camposPerfil = [
  {
    titulo: "Dados pessoais",
    icone: "user.svg",
    campos: [
      { id: "nome", label: "Nome completo", tipo: "text" },
      { id: "cpf", label: "CPF", tipo: "text", bloqueado: true },
      { id: "nascimento", label: "Data de nascimento", tipo: "date" },
      { id: "sexo", label: "Sexo (opcional)", tipo: "select",
        opcoes: ["", "Feminino", "Masculino", "Prefiro não informar"] }
    ]
  },
  {
    titulo: "Informações de contato",
    icone: "user.svg",
    campos: [
      { id: "telefone", label: "Telefone / WhatsApp", tipo: "tel" },
      { id: "email", label: "E-mail", tipo: "email" },
      { id: "cep", label: "CEP", tipo: "text" },
      { id: "endereco", label: "Endereço", tipo: "text" }
    ]
  },
  {
    titulo: "Informações do SUS",
    icone: "hospital.svg",
    campos: [
      { id: "cartaoSus", label: "Cartão Nacional de Saúde (CNS)", tipo: "text" },
      { id: "ubs", label: "UBS de referência", tipo: "text" },
      { id: "municipio", label: "Município", tipo: "text" },
      { id: "uf", label: "UF", tipo: "text" }
    ]
  },
  {
    titulo: "Preferências de atendimento",
    icone: "sun-moon.svg",
    campos: [
      { id: "contatoPreferido", label: "Preferência de contato", tipo: "select",
        opcoes: ["", "Telefone", "WhatsApp", "E-mail"] },
      { id: "acessibilidade", label: "Recursos de acessibilidade", tipo: "select",
        opcoes: ["", "Nenhum", "Libras", "Alto contraste", "Fonte ampliada", "Outro"] }
    ]
  }
];

// CARREGAR INFORMAÇÕES SALVAS
function obterPerfil() {
  let dados = {};

  try {
    dados = JSON.parse(localStorage.getItem(CHAVE_PERFIL)) || {};
  } catch {
    dados = {};
  }

  return {
    ...dados,
    nome: dados.nome || paciente.nome,
    cpf: paciente.cpf,
    ubs: dados.ubs || paciente.ubs,
    cartaoSus: dados.cartaoSus || paciente.cartaoSus
  };
}

// FORMATAR NOME
function formatarNomePerfil(nome) {
  return nome.trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .split(" ")
    .map(parte =>
      parte.charAt(0).toLocaleUpperCase("pt-BR") +
      parte.slice(1)
    )
    .join(" ");
}

// CONSTRUIR PÁGINA
function carregarPerfil(area) {
  area.replaceChildren();

  const dados = obterPerfil();

  const formulario = document.createElement("form");
  formulario.id = "formPerfil";
  formulario.className = "perfil-formulario";

  // CABEÇALHO DO PERFIL
  const cabecalho = document.createElement("div");
  cabecalho.className = "perfil-cabecalho";

  const identidade = document.createElement("div");
  identidade.className = "perfil-identidade";

  const avatar = document.createElement("div");
  avatar.className = "perfil-avatar";
  avatar.textContent = (dados.nome || "P").charAt(0).toUpperCase();

  const texto = document.createElement("div");

  const nomeTitulo = document.createElement("h3");
  nomeTitulo.textContent = dados.nome || "Paciente";

  const descricao = document.createElement("p");
  descricao.textContent = "Meu perfil de paciente";

  texto.append(nomeTitulo, descricao);
  identidade.append(avatar, texto);

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.className = "perfil-botao-editar";
  botaoEditar.textContent = "Editar perfil";

  cabecalho.append(identidade, botaoEditar);
  formulario.appendChild(cabecalho);

  // CARTÕES DE INFORMAÇÕES
  camposPerfil.forEach(secao => {
    const cartao = document.createElement("section");
    cartao.className = "perfil-cartao";

    const titulo = document.createElement("h3");
    titulo.className = "perfil-titulo";
    titulo.textContent = secao.titulo;

    const grade = document.createElement("div");
    grade.className = "perfil-grade";

    secao.campos.forEach(campo => {
      const grupo = document.createElement("div");
      grupo.className = "perfil-campo";

      const label = document.createElement("label");
      label.htmlFor = "perfil-" + campo.id;
      label.textContent = campo.label;

      let input;

      if (campo.tipo === "select") {
        input = document.createElement("select");

        campo.opcoes.forEach(opcao => {
          const elemento = document.createElement("option");
          elemento.value = opcao;
          elemento.textContent = opcao || "Selecione";
          input.appendChild(elemento);
        });
      } else {
        input = document.createElement("input");
        input.type = campo.tipo;
      }

      input.id = "perfil-" + campo.id;
      input.name = campo.id;
      input.value = dados[campo.id] || "";
      input.disabled = true;

      if (campo.bloqueado) {
        input.dataset.bloqueado = "true";
      }

      grupo.append(label, input);
      grade.appendChild(grupo);
    });

    cartao.append(titulo, grade);
    formulario.appendChild(cartao);
  });

  // BOTÕES DE SALVAR E CANCELAR
  const acoes = document.createElement("div");
  acoes.className = "perfil-acoes";
  acoes.hidden = true;

  const cancelar = document.createElement("button");
  cancelar.type = "button";
  cancelar.className = "perfil-botao-cancelar";
  cancelar.textContent = "Cancelar";

  const salvar = document.createElement("button");
  salvar.type = "submit";
  salvar.className = "primary-button";
  salvar.textContent = "Salvar informações";

  acoes.append(cancelar, salvar);
  formulario.appendChild(acoes);

  area.appendChild(formulario);

  
  // ENTER AVANÇA PARA O PRÓXIMO CAMPO
  formulario.addEventListener("keydown", function(evento) {

    if (evento.key !== "Enter") return;

    evento.preventDefault();

    const campos = Array.from(
      formulario.querySelectorAll("input:not(:disabled), select:not(:disabled)")
    );

    const posicao = campos.indexOf(document.activeElement);

    if (posicao >= 0 && posicao < campos.length - 1) {
      campos[posicao + 1].focus();
    } else if (posicao === campos.length - 1) {
      campos[posicao].blur();
    }

  });


  // ATIVAR EDIÇÃO
  botaoEditar.addEventListener("click", () => {
    formulario.querySelectorAll("input, select").forEach(input => {
      if (input.dataset.bloqueado !== "true") {
        input.disabled = false;
      }
    });

    botaoEditar.hidden = true;
    acoes.hidden = false;
  });

  // CANCELAR EDIÇÃO
  cancelar.addEventListener("click", () => {
    carregarPerfil(area);
  });

  
  // MÁSCARA AUTOMÁTICA DO TELEFONE
  const telefoneInput = formulario.querySelector("#perfil-telefone");

  telefoneInput.addEventListener("input", function() {

    let numeros = this.value.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) {
      this.value = numeros.length === 2
        ? `(${numeros}) `
        : numeros;
      return;
    }

    const ddd = numeros.slice(0, 2);
    const restante = numeros.slice(2);

    if (restante.length <= 4) {
      this.value = `(${ddd}) ${restante}`;
    } else if (restante.length <= 8) {
      this.value = `(${ddd}) ${restante.slice(0, 4)}-${restante.slice(4)}`;
    } else {
      this.value = `(${ddd}) ${restante[0]} ${restante.slice(1, 5)}-${restante.slice(5)}`;
    }

  });

  
  // BUSCA AUTOMÁTICA DE ENDEREÇO PELO CEP
  const cepInput = formulario.querySelector("#perfil-cep");
  const enderecoInput = formulario.querySelector("#perfil-endereco");
  const municipioInput = formulario.querySelector("#perfil-municipio");
  const ufInput = formulario.querySelector("#perfil-uf");

  let ultimaBuscaCEP = 0;

  cepInput.addEventListener("input", async function() {

    const numeros = this.value.replace(/\D/g, "").slice(0, 8);

    this.value = numeros.length > 5
      ? numeros.slice(0, 5) + "-" + numeros.slice(5)
      : numeros;

    const buscaAtual = ++ultimaBuscaCEP;

    if (numeros.length !== 8) return;

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${numeros}/json/`
      );

      if (!resposta.ok) {
        throw new Error("Falha na consulta");
      }

      const dados = await resposta.json();

      if (buscaAtual !== ultimaBuscaCEP) return;

      if (dados.erro) {
        mostrarModal("CEP não encontrado", "Verifique o CEP informado.");
        return;
      }

      // PREENCHIMENTO AUTOMÁTICO
      enderecoInput.value = [
        dados.logradouro,
        dados.bairro
      ].filter(Boolean).join(" - ");

      municipioInput.value = dados.localidade || "";
      ufInput.value = dados.uf || "";

      // MANTER OS CAMPOS EDITÁVEIS
      enderecoInput.disabled = false;
      municipioInput.disabled = false;
      ufInput.disabled = false;

    } catch (erro) {
      if (buscaAtual !== ultimaBuscaCEP) return;

      mostrarModal(
        "Erro na consulta",
        "Não foi possível consultar o CEP. Preencha o endereço manualmente."
      );
    }

  });

  // SALVAR DADOS
  formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const novosDados = {};

    camposPerfil.forEach(secao => {
      secao.campos.forEach(campo => {
        const input = document.getElementById("perfil-" + campo.id);
        novosDados[campo.id] = input.value.trim();
      });
    });

    novosDados.nome = formatarNomePerfil(novosDados.nome);

    if (novosDados.nome.length < 2) {
      mostrarModal("Atenção", "Informe um nome válido.");
      return;
    }

    // CPF permanece vinculado à sessão
    novosDados.cpf = paciente.cpf;

    localStorage.setItem(
      CHAVE_PERFIL,
      JSON.stringify(novosDados)
    );

    // ATUALIZAR DADOS NA PÁGINA
    paciente.nome = novosDados.nome;
    paciente.ubs = novosDados.ubs;
    paciente.cartaoSus = novosDados.cartaoSus;

    $("nomeBoasVindas").textContent =
      novosDados.nome.split(" ")[0];

    $("nomePerfil").textContent = novosDados.nome;

    $("ubsUsuario").textContent =
      novosDados.ubs || "Não informada";

    $("cartaoSus").textContent =
      novosDados.cartaoSus || "Não informado";

    carregarPerfil(area);

    mostrarModal(
      "Informações salvas",
      "Seu perfil foi atualizado com sucesso neste navegador."
    );
  });
}
// ======================================
// PRÉ-TRIAGEM - TELESUS
// ======================================

function carregarPreTriagem(area) {

  const perguntasEmergencia = [
    "Você está com dificuldade intensa para respirar?",
    "Está sentindo dor forte ou pressão no peito de início súbito?",
    "Apresentou alteração súbita na fala, fraqueza de um lado do corpo ou desvio na boca?",
    "Teve desmaio, convulsão ou confusão mental súbita?",
    "Está com sangramento intenso ou sofreu um acidente grave?"
  ];
let riscoIdentificado = false;

  // TELA INICIAL
  function mostrarInicio() {

    area.innerHTML = `
      <div class="triagem-container">

        <div class="triagem-card">

          <span class="triagem-etapa">TELESUS • ATENDIMENTO</span>

          <h2>Pré-triagem de atendimento</h2>

          <p>
            Antes de solicitar uma consulta, precisamos conhecer
            um pouco sobre sua situação.
          </p>

          <p>
            Você responderá algumas perguntas rápidas para receber
            orientações sobre os próximos passos.
          </p>

          <div class="triagem-alerta">
            <strong>Atenção</strong>
            <p>
              Esta ferramenta não substitui a avaliação de um
              profissional de saúde. Em uma emergência, não espere
              terminar o questionário. Ligue 192.
            </p>
          </div>

          <div class="triagem-acoes">
            <button type="button" class="triagem-btn" id="iniciarTriagem">
              Iniciar pré-triagem
            </button>

            <button type="button" class="triagem-btn-secundario" id="irPS">
              Orientações para Pronto-Socorro
            </button>
          </div>

        </div>
      </div>
    `;

    area.querySelector("#iniciarTriagem")
      .addEventListener("click", mostrarPerguntasEmergencia);

    area.querySelector("#irPS")
      .addEventListener("click", mostrarOrientacaoPresencial);
  }


  // ETAPA 1 - SINAIS DE EMERGÊNCIA
  function mostrarPerguntasEmergencia() {

    area.innerHTML = `
      <div class="triagem-container">

        <div class="triagem-card">

          <span class="triagem-etapa">ETAPA 1 DE 2</span>

          <div class="triagem-progresso">
            <div style="width: 50%"></div>
          </div>

          <h2>Identificação de sinais de emergência</h2>

          <p>
            Responda às perguntas considerando o que está
            acontecendo com você neste momento.
          </p>

          <p>
  Responda às perguntas considerando o que está
  acontecendo com você neste momento.
</p>

<div class="triagem-alerta" role="alert">
  <strong>Atenção</strong>
  <p>
    Se você estiver apresentando sinais de emergência,
    não espere finalizar esta triagem.
    Procure atendimento imediato ou ligue para o SAMU 192.
  </p>
</div>

<div id="listaPerguntasEmergencia"></div>

          <div class="triagem-acoes">

            <button type="button" class="triagem-btn-secundario" id="voltarTriagem">
              Voltar
            </button>

            <button type="button" class="triagem-btn" id="continuarTriagem" disabled>
              Continuar
            </button>

          </div>

        </div>
      </div>
    `;

    const lista = area.querySelector("#listaPerguntasEmergencia");

    perguntasEmergencia.forEach((pergunta, indice) => {

      const bloco = document.createElement("fieldset");
      bloco.className = "triagem-pergunta";

      bloco.innerHTML = `
        <legend>${indice + 1}. ${pergunta}</legend>

        <div class="triagem-opcoes">

          <label>
            <input type="radio" name="emergencia${indice}" value="sim">
            Sim
          </label>

          <label>
            <input type="radio" name="emergencia${indice}" value="nao">
            Não
          </label>

        </div>
      `;

      lista.appendChild(bloco);
    });

    const botaoContinuar = area.querySelector("#continuarTriagem");

    // VERIFICAR RESPOSTAS
 lista.addEventListener("change", function() {

  const respostas = lista.querySelectorAll(
    'input[type="radio"]:checked'
  );

  riscoIdentificado = Array.from(respostas).some(
    resposta => resposta.value === "sim"
  );

  botaoContinuar.disabled =
    respostas.length !== perguntasEmergencia.length;
});

    botaoContinuar.addEventListener("click", mostrarPerguntasSintomas);

    area.querySelector("#voltarTriagem")
      .addEventListener("click", mostrarInicio);
  }


  // ETAPA 2 - SINTOMAS
  function mostrarPerguntasSintomas() {

    area.innerHTML = `
      <div class="triagem-container">

        <div class="triagem-card">

          <span class="triagem-etapa">ETAPA 2 DE 2</span>

          <div class="triagem-progresso">
            <div style="width: 100%"></div>
          </div>

          <h2>Informações sobre seus sintomas</h2>

          <p>
            Nenhum dos sinais de emergência perguntados foi marcado.
            Isso não exclui a possibilidade de uma urgência.
          </p>

          <div class="triagem-campo">

            <label for="motivoConsulta">
              Qual é o principal motivo do atendimento?
            </label>

            <select id="motivoConsulta">

              <option value="">Selecione uma opção</option>
              <option value="Febre">Febre</option>
              <option value="Tosse ou resfriado">Tosse ou resfriado</option>
              <option value="Dor de cabeça">Dor de cabeça</option>
              <option value="Dor abdominal">Dor abdominal</option>
              <option value="Mal-estar">Mal-estar</option>
              <option value="Acompanhamento">Consulta de acompanhamento</option>
              <option value="Outro">Outro motivo</option>

            </select>

          </div>

          <div class="triagem-campo">

            <label for="tempoSintomas">
              Há quanto tempo os sintomas começaram?
            </label>

            <select id="tempoSintomas">

              <option value="">Selecione uma opção</option>
              <option value="Hoje">Hoje</option>
              <option value="1 a 3 dias">Entre 1 e 3 dias</option>
              <option value="4 a 7 dias">Entre 4 e 7 dias</option>
              <option value="Mais de uma semana">Mais de uma semana</option>
              <option value="Não se aplica">Não se aplica</option>

            </select>

          </div>

          <div class="triagem-campo">

            <label for="descricaoSintomas">
              Gostaria de acrescentar alguma informação? (Opcional)
            </label>

            <textarea
              id="descricaoSintomas"
              maxlength="300"
              placeholder="Descreva brevemente o motivo da consulta..."
            ></textarea>

          </div>

          <p class="triagem-aviso" id="avisoTriagem" role="alert"></p>

          <div class="triagem-acoes">

            <button type="button" class="triagem-btn-secundario" id="voltarSintomas">
              Voltar
            </button>

            <button type="button" class="triagem-btn" id="finalizarTriagem">
              Finalizar pré-triagem
            </button>

          </div>

        </div>
      </div>
    `;

    area.querySelector("#voltarSintomas")
      .addEventListener("click", mostrarPerguntasEmergencia);

    area.querySelector("#finalizarTriagem")
      .addEventListener("click", function() {

        const motivo = area.querySelector("#motivoConsulta").value;
        const tempo = area.querySelector("#tempoSintomas").value;

        if (!motivo || !tempo) {
          area.querySelector("#avisoTriagem").textContent =
            "Preencha os campos obrigatórios para continuar.";
          return;
        }

       if (riscoIdentificado) {
  mostrarEmergencia();
} 
 else {
  mostrarResultado(motivo, tempo);
}
      });
  }


  // RESULTADO - CLÍNICA GERAL
  function mostrarResultado(motivo, tempo) {

    area.innerHTML = `
      <div class="triagem-container">

        <div class="triagem-card">

          <div class="triagem-resultado-icone">✓</div>

          <h2>Pré-triagem concluída</h2>

          <p>
            Suas respostas foram registradas nesta etapa
            da demonstração.
          </p>

          <div class="triagem-resumo">

            <h3>Resumo das informações</h3>

            <p>
              <strong>Motivo:</strong>
              <span id="resumoMotivo"></span>
            </p>

            <p>
              <strong>Início dos sintomas:</strong>
              <span id="resumoTempo"></span>
            </p>

          </div>

          <div class="triagem-alerta">
            <strong>Orientação importante</strong>
            <p>
              Este questionário não determina se uma consulta
              pode esperar. Caso precise de atendimento imediato,
              procure uma unidade de urgência. Se surgirem sinais
              de emergência, acione o SAMU 192.
            </p>
          </div>

          <h3>Solicitação de Clínica Geral</h3>

          <p>
            Você poderá continuar para a seleção de data
            e horário de uma consulta de Clínica Geral.
          </p>

          <div class="triagem-acoes">

            <button type="button" class="triagem-btn" id="escolherHorario">
              Escolher data e horário
            </button>

            <button type="button" class="triagem-btn-secundario" id="resultadoPS">
              Preciso de atendimento presencial
            </button>

          </div>

        </div>
      </div>
    `;

    area.querySelector("#resumoMotivo").textContent = motivo;
    area.querySelector("#resumoTempo").textContent = tempo;

    area.querySelector("#escolherHorario")
      .addEventListener("click", () => mostrarCalendario(area, { motivo, tempo }));

    area.querySelector("#resultadoPS")
      .addEventListener("click", mostrarOrientacaoPresencial);
  }


  // RESULTADO - EMERGÊNCIA
  function mostrarEmergencia() {

    area.innerHTML = `
      <div class="triagem-container">

        <div class="triagem-card triagem-emergencia" role="alert">

          <div class="triagem-emergencia-numero">192</div>

          <h2>Procure atendimento imediatamente</h2>

          <p>
            Você informou um possível sinal de emergência.
            Não aguarde um agendamento ou atendimento virtual.
          </p>

          <p>
            Procure atendimento de emergência.
            Se houver risco imediato, ou se não conseguir
            se deslocar com segurança, acione o SAMU.
          </p>

          <a href="tel:192" class="triagem-btn-emergencia">
            Ligar para o SAMU — 192
          </a>

          <p class="triagem-nota">
            O SAMU é um serviço gratuito de atendimento
            a urgências e emergências no Brasil.
          </p>

          <button type="button" class="triagem-btn-secundario" id="reiniciarTriagem">
            Corrigir minhas respostas
          </button>

        </div>
      </div>
    `;

    area.querySelector("#reiniciarTriagem")
      .addEventListener("click", mostrarPerguntasEmergencia);
  }


  // ORIENTAÇÕES - PRONTO-SOCORRO
  function mostrarOrientacaoPresencial() {

    area.innerHTML = `
      <div class="triagem-container">

        <div class="triagem-card">

          <span class="triagem-etapa">ATENDIMENTO PRESENCIAL</span>

          <h2>Pronto-Socorro e UPA</h2>

          <p>
            Se você precisa de avaliação presencial urgente,
            procure uma unidade de pronto atendimento adequada
            à sua situação.
          </p>

          <div class="triagem-alerta">
            <strong>Atenção aos sinais de emergência</strong>

            <p>
              Em situações como dificuldade intensa para respirar,
              dor forte no peito ou suspeita de AVC, não espere:
              procure atendimento de emergência ou ligue 192.
            </p>
          </div>

          <p>
            O TeleSus não realiza agendamentos de horários
            para Pronto-Socorro neste protótipo.
          </p>

          <div class="triagem-acoes">

            <button type="button" class="triagem-btn-secundario" id="voltarInicio">
              Voltar ao início
            </button>

            <a href="tel:192" class="triagem-btn">
              SAMU 192
            </a>

          </div>

        </div>
      </div>
    `;

    area.querySelector("#voltarInicio")
      .addEventListener("click", mostrarInicio);
  }

  mostrarInicio();
}

// ======================================
// AGENDAMENTOS FICTÍCIOS - TELESUS
// ======================================
// Dados de demonstração armazenados apenas neste navegador.
const CHAVE_AGENDAMENTOS = "TeleSusAgendamentos_" + paciente.cpf.replace(/\D/g, "");
const HORARIOS_CONSULTA = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

function lerAgendamentos() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarAgendamentos(lista) {
  localStorage.setItem(CHAVE_AGENDAMENTOS, JSON.stringify(lista));
}

function dataLocalISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function dataPorExtenso(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  });
}

function consultasFuturas() {
  const agora = new Date();
  return lerAgendamentos()
    .filter(item => item.status === "agendado" && new Date(`${item.data}T${item.hora}:00`) > agora)
    .sort((a, b) => `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`));
}

function mostrarCalendario(area, triagem) {
  const hoje = new Date();
  const dias = [];
  // Agenda fictícia: próximos 30 dias corridos, de segunda a sexta.
  for (let i = 1; i <= 30; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
    if (data.getDay() !== 0 && data.getDay() !== 6) dias.push(data);
  }

  let diaSelecionado = "";
  let horaSelecionada = "";
  area.innerHTML = `
    <div class="triagem-container">
      <div class="triagem-card">
        <span class="triagem-etapa">AGENDAMENTO • CLÍNICA GERAL</span>
        <h2>Escolha a data e o horário</h2>
        <p>Selecione uma opção para solicitar uma consulta fictícia. Estes horários não representam vagas reais do SUS.</p>
        <h3>Datas disponíveis</h3>
        <div class="agenda-dias" id="agendaDias"></div>
        <h3>Horários</h3>
        <div class="agenda-horarios" id="agendaHorarios"></div>
        <p class="triagem-aviso" id="agendaAviso" role="alert"></p>
        <div class="triagem-acoes">
          <button type="button" class="triagem-btn" id="confirmarHorario" disabled>Revisar solicitação</button>
          <button type="button" class="triagem-btn-secundario" id="voltarAgendamento">Voltar à pré-triagem</button>
        </div>
      </div>
    </div>`;

  const gradeDias = area.querySelector("#agendaDias");
  const gradeHoras = area.querySelector("#agendaHorarios");
  const confirmar = area.querySelector("#confirmarHorario");

  function atualizarHoras() {
    gradeHoras.replaceChildren();
    horaSelecionada = "";
    confirmar.disabled = true;
    const ocupados = lerAgendamentos()
      .filter(a => a.data === diaSelecionado && a.status === "agendado")
      .map(a => a.hora);
    HORARIOS_CONSULTA.forEach(hora => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "agenda-opcao";
      botao.textContent = hora;
      botao.disabled = ocupados.includes(hora);
      botao.title = botao.disabled ? "Horário já solicitado neste navegador" : "";
      botao.addEventListener("click", () => {
        horaSelecionada = hora;
        gradeHoras.querySelectorAll("button").forEach(b => b.classList.toggle("selecionado", b === botao));
        confirmar.disabled = false;
      });
      gradeHoras.appendChild(botao);
    });
  }

  dias.forEach(data => {
    const iso = dataLocalISO(data);
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "agenda-opcao agenda-dia";
    botao.textContent = data.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
    botao.addEventListener("click", () => {
      diaSelecionado = iso;
      gradeDias.querySelectorAll("button").forEach(b => b.classList.toggle("selecionado", b === botao));
      atualizarHoras();
    });
    gradeDias.appendChild(botao);
  });

  confirmar.addEventListener("click", () => {
    if (diaSelecionado && horaSelecionada) mostrarConfirmacao(area, diaSelecionado, horaSelecionada, triagem);
  });
  area.querySelector("#voltarAgendamento").addEventListener("click", () => carregarPreTriagem(area));
}

function mostrarConfirmacao(area, data, hora, triagem) {
  area.innerHTML = `
    <div class="triagem-container"><div class="triagem-card">
      <span class="triagem-etapa">CONFIRMAÇÃO</span>
      <h2>Revise sua solicitação</h2>
      <div class="triagem-resumo">
        <p><strong>Especialidade:</strong> Clínica Geral</p>
        <p><strong>Data:</strong> <span id="confirmarData"></span></p>
        <p><strong>Horário:</strong> <span id="confirmarHora"></span></p>
        <p><strong>Modalidade:</strong> Simulação de agendamento</p>
      </div>
      <p>Este registro é apenas uma demonstração acadêmica e não garante atendimento pelo SUS.</p>
      <div class="triagem-acoes">
        <button type="button" class="triagem-btn" id="salvarConsulta">Confirmar solicitação</button>
        <button type="button" class="triagem-btn-secundario" id="alterarHorario">Alterar data ou horário</button>
      </div>
    </div></div>`;
  area.querySelector("#confirmarData").textContent = dataPorExtenso(data);
  area.querySelector("#confirmarHora").textContent = hora;
  area.querySelector("#alterarHorario").addEventListener("click", () => mostrarCalendario(area, triagem));
  area.querySelector("#salvarConsulta").addEventListener("click", () => {
    const lista = lerAgendamentos();
    if (lista.some(a => a.data === data && a.hora === hora && a.status === "agendado")) {
      mostrarModal("Horário indisponível", "Você já registrou uma consulta nesse horário. Escolha outro.");
      mostrarCalendario(area, triagem);
      return;
    }
    lista.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      especialidade: "Clínica Geral", data, hora,
      status: "agendado",
      // O protótipo não armazena respostas sobre sintomas.
      criadoEm: new Date().toISOString()
    });
    try {
      salvarAgendamentos(lista);
    } catch {
      mostrarModal("Não foi possível salvar", "Verifique se o navegador permite armazenamento local.");
      return;
    }
    atualizarResumoInicio();
    mostrarConsultaRegistrada(area, data, hora);
  });
}

function mostrarConsultaRegistrada(area, data, hora) {
  area.innerHTML = `
    <div class="triagem-container"><div class="triagem-card">
      <div class="triagem-resultado-icone">✓</div>
      <h2>Solicitação registrada!</h2>
      <p>Sua consulta fictícia de Clínica Geral foi registrada neste navegador.</p>
      <div class="triagem-resumo"><p id="consultaRegistrada"></p></div>
      <p>Este agendamento não foi enviado ao SUS e não representa uma consulta confirmada por uma unidade de saúde.</p>
      <button type="button" class="triagem-btn" id="verMinhasConsultas">Ver meus agendamentos</button>
    </div></div>`;
  area.querySelector("#consultaRegistrada").textContent = `${dataPorExtenso(data)} às ${hora}`;
  area.querySelector("#verMinhasConsultas").addEventListener("click", () => navegar("meus-agendamentos"));
}

function carregarMeusAgendamentos(area) {
  area.replaceChildren();
  const lista = lerAgendamentos().sort((a, b) => `${b.data}T${b.hora}`.localeCompare(`${a.data}T${a.hora}`));
  const painel = document.createElement("div");
  painel.className = "triagem-container";
  const cabecalho = document.createElement("div");
  cabecalho.className = "triagem-card";
  cabecalho.innerHTML = `<h2>Meus agendamentos</h2><p>Consultas fictícias registradas neste navegador. Nenhuma solicitação foi enviada ao SUS.</p>`;
  painel.appendChild(cabecalho);
  if (!lista.length) {
    const vazio = document.createElement("div");
    vazio.className = "triagem-card agenda-cartao";
    vazio.textContent = "Você ainda não possui agendamentos registrados.";
    painel.appendChild(vazio);
  }
  lista.forEach(consulta => {
    const cartao = document.createElement("div");
    cartao.className = "triagem-card agenda-cartao";
    const titulo = document.createElement("h3");
    titulo.textContent = consulta.especialidade;
    const detalhe = document.createElement("p");
    detalhe.textContent = `${dataPorExtenso(consulta.data)} às ${consulta.hora}`;
    const estado = document.createElement("p");
    const passou = new Date(`${consulta.data}T${consulta.hora}:00`) <= new Date();
    estado.textContent = consulta.status === "cancelado" ? "Cancelado" : passou ? "Data já passou" : "Solicitação registrada";
    cartao.append(titulo, detalhe, estado);
    if (consulta.status === "agendado" && !passou) {
      const cancelar = document.createElement("button");
      cancelar.type = "button";
      cancelar.className = "triagem-btn-secundario";
      cancelar.textContent = "Cancelar solicitação";
      cancelar.addEventListener("click", () => {
        if (!window.confirm("Deseja cancelar esta solicitação fictícia?")) return;
        const dados = lerAgendamentos();
        const item = dados.find(a => a.id === consulta.id);
        if (item) item.status = "cancelado";
        salvarAgendamentos(dados);
        atualizarResumoInicio();
        carregarMeusAgendamentos(area);
      });
      cartao.appendChild(cancelar);
    }
    painel.appendChild(cartao);
  });
  area.appendChild(painel);
}

function atualizarResumoInicio() {
  const banner = document.querySelector(".consultation-banner");
  if (!banner) return;
  let resumo = banner.querySelector("#resumoConsultaFicticia");
  if (!resumo) {
    resumo = document.createElement("div");
    resumo.id = "resumoConsultaFicticia";
    resumo.className = "agenda-resumo-inicio";
    banner.appendChild(resumo);
  }
  const proxima = consultasFuturas()[0];
  resumo.textContent = proxima
    ? `Próxima solicitação fictícia: Clínica Geral — ${dataPorExtenso(proxima.data)} às ${proxima.hora}. Não confirmada pelo SUS.`
    : "Você não possui solicitações futuras registradas neste navegador.";
}

// INICIAR APÓS CARREGAR TODAS AS CONSTANTES E FUNÇÕES
inicializar();
