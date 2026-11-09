
const $ = (id) => document.getElementById(id);

const cpfInput = $("cpf");
const senhaInput = $("senha");
const erro = $("formError");
const modal = $("modal");

const CHAVE_SESSAO = "TeleSusSessao";


// FORMATAR NOME
function formatarNome(nome) {
  return nome
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .split(" ")
    .map(parte => {
      return parte.charAt(0).toLocaleUpperCase("pt-BR") +
             parte.slice(1);
    })
    .join(" ");
}

// FORMATAR AO SAIR DO CAMPO
$("nome").addEventListener("blur", function () {
  this.value = formatarNome(this.value);
});


let ultimoFoco = null;

// FORMATAÇÃO DO CPF
function formatarCPF(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

// VALIDAÇÃO DO CPF
function validarCPF(valor) {
  const cpf = valor.replace(/\D/g, "");

  if (cpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  for (let posicao = 9; posicao <= 10; posicao++) {
    let soma = 0;

    for (let i = 0; i < posicao; i++) {
      soma += Number(cpf[i]) * (posicao + 1 - i);
    }

    const digito = ((soma * 10) % 11) % 10;

    if (digito !== Number(cpf[posicao])) {
      return false;
    }
  }

  return true;
}

// ATUALIZAÇÃO DO CAMPO CPF
cpfInput.addEventListener("input", function () {
  cpfInput.value = formatarCPF(cpfInput.value);
  erro.textContent = "";
});

// LIMPAR ERRO AO DIGITAR SENHA
senhaInput.addEventListener("input", function () {
  erro.textContent = "";
});

// MOSTRAR E OCULTAR SENHA
$("togglePassword").addEventListener("click", function () {
  const mostrar = senhaInput.type === "password";

  senhaInput.type = mostrar ? "text" : "password";

  this.setAttribute(
    "aria-label",
    mostrar ? "Ocultar senha" : "Mostrar senha"
  );
});

// ABRIR MENSAGENS
function mostrarModal(titulo, mensagem) {
  ultimoFoco = document.activeElement;

  $("modalTitle").textContent = titulo;
  $("modalText").textContent = mensagem;

  modal.hidden = false;

  $("modalOk").focus();
}

// FECHAR MENSAGENS
function fecharModal() {
  modal.hidden = true;

  if (ultimoFoco) {
    ultimoFoco.focus();
  }
}

$("modalClose").addEventListener("click", fecharModal);
$("modalOk").addEventListener("click", fecharModal);

modal.addEventListener("click", function (evento) {
  if (evento.target === modal) {
    fecharModal();
  }
});

document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape" && !modal.hidden) {
    fecharModal();
  }
});

// BOTÃO GOV.BR
$("govButton").addEventListener("click", function () {
  mostrarModal(
    "Função ainda não disponível",
    "A integração com o gov.br estará disponível em uma futura atualização do TeleSus."
  );
});

// ESQUECI MINHA SENHA
$("forgot").addEventListener("click", function () {
  mostrarModal(
    "Recuperação de senha",
    "Esta função ainda não está disponível."
  );
});

// SAIBA MAIS
$("about").addEventListener("click", function () {
  mostrarModal(
    "Sobre o TeleSus",
    "O TeleSus é um projeto acadêmico de telemedicina que propõe consultas, triagem e acompanhamento médico online. Não é um serviço oficial do SUS."
  );
});

// ABRIR PÁGINA INICIAL
function abrirPaginaInicial(sessao) {
  window.location.href = "TeleSusInicio.html";
}
// ABRIR PÁGINA DE LOGIN
function abrirPaginaLogin() {
  $("telaInicial").hidden = true;
  $("telaLogin").hidden = false;

  senhaInput.value = "";
  erro.textContent = "";

  window.scrollTo(0, 0);
}

// REALIZAR LOGIN
$("loginForm").addEventListener("submit", function (evento) {
  evento.preventDefault();

 const nome = formatarNome($("nome").value);
 const cpf = cpfInput.value;
 const senha = senhaInput.value;

 if (nome.length < 2) {
  erro.textContent = "Digite seu nome completo.";
  $("nome").focus();
  return;
}

$("nome").value = nome;

  if (!validarCPF(cpf)) {
    erro.textContent = "Digite um CPF válido para continuar.";
    cpfInput.focus();
    return;
  }

  if (senha.trim() === "") {
    erro.textContent = "Digite sua senha para continuar.";
    senhaInput.focus();
    return;
  }

  // Acesso acadêmico simulado.
  // Nenhuma senha é salva ou enviada.
 const sessao = {
  nome: nome,
  cpf: cpf,
  dataAcesso: new Date().toISOString()
};

  localStorage.removeItem(CHAVE_SESSAO);
  sessionStorage.removeItem(CHAVE_SESSAO);

  if ($("remember").checked) {
    localStorage.setItem(
      CHAVE_SESSAO,
      JSON.stringify(sessao)
    );
  } else {
    sessionStorage.setItem(
      CHAVE_SESSAO,
      JSON.stringify(sessao)
    );
  }

  abrirPaginaInicial(sessao);
});

// SAIR DO SISTEMA
$("sairButton").addEventListener("click", function () {
  localStorage.removeItem(CHAVE_SESSAO);
  sessionStorage.removeItem(CHAVE_SESSAO);

  abrirPaginaLogin();
});

// VERIFICAR SE JÁ EXISTE UMA SESSÃO
function verificarSessao() {
  const dados =
    sessionStorage.getItem(CHAVE_SESSAO) ||
    localStorage.getItem(CHAVE_SESSAO);

  if (!dados) {
    return;
  }

  try {
    const sessao = JSON.parse(dados);

    if (sessao && sessao.cpf) {
      abrirPaginaInicial(sessao);
    }
  } catch (erroSessao) {
    localStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_SESSAO);
  }
}

//verificarSessao();
