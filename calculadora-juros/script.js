const TAXA_CDI_MENSAL = 0.83;
const CHAVE_HISTORICO = "historicoSimulacoes";

document.addEventListener("DOMContentLoaded", function () {
  atualizarLabels();
  carregarHistorico();
  document.getElementById("TipoInvestimento").addEventListener("change", atualizarLabels);
});

function ValorInvalido(campo) {
  campo.classList.add("is-invalid");
}

function atualizarLabels() {
  const tipo = document.getElementById("TipoInvestimento").value;
  const labelJuros = document.getElementById("labelJuros");
  const inputJuros = document.getElementById("Juros");
  const helpJuros = document.getElementById("helpJuros");

  inputJuros.value = "";

  if (tipo === "nominal") {
    labelJuros.innerText = "Taxa de Juros (% ao mês)";
    inputJuros.placeholder = "Ex: 0,50";
    helpJuros.innerText = "Simulação baseada no rendimento mensal padrão da Poupança.";
  } else if (tipo === "cdi") {
    labelJuros.innerText = "Rentabilidade (% do CDI)";
    inputJuros.placeholder = "Ex: 100";
    helpJuros.innerText = `Considerando o CDI mensal de referência de ${TAXA_CDI_MENSAL}%.`;
  } else if (tipo === "cdb") {
    labelJuros.innerText = "Taxa equivalente (% ao ano)";
    inputJuros.placeholder = "Ex: 11,5";
    helpJuros.innerText = "Informe a taxa anual. O sistema calcula o equivalente mensal.";
  }
}

function simular() {
  const aporte = parseFloat(document.getElementById("Aporte").value.replace(",", "."));
  const juros = parseFloat(document.getElementById("Juros").value.replace(",", "."));
  const tempo = parseInt(document.getElementById("Tempo").value);
  const tipo = document.getElementById("TipoInvestimento").value;
  let valido = true;

  const campoAporte = document.getElementById("Aporte");
  const campoJuros = document.getElementById("Juros");
  const campoTempo = document.getElementById("Tempo");

  if (isNaN(aporte) || aporte < 0) {
    valido = false;
    ValorInvalido(campoAporte);
  } else campoAporte.classList.remove("is-invalid");

  if (isNaN(juros) || juros < 0) {
    valido = false;
    ValorInvalido(campoJuros);
  } else campoJuros.classList.remove("is-invalid");

  if (isNaN(tempo) || tempo < 1 || tempo > 60) {
    valido = false;
    ValorInvalido(campoTempo);
  } else campoTempo.classList.remove("is-invalid");

  if (!valido) return;

  let jurosMensalCalculado = 0;
  let nomeTipoAmigavel = "";

  if (tipo === "nominal") {
    nomeTipoAmigavel = "POUPANÇA";
    jurosMensalCalculado = juros;
  } else if (tipo === "cdi") {
    nomeTipoAmigavel = "CDB / TESOURO (CDI)";
    jurosMensalCalculado = (juros / 100) * TAXA_CDI_MENSAL;
  } else if (tipo === "cdb") {
    nomeTipoAmigavel = "LCI / LCA (ANUAL)";
    const taxaAnualDecimal = juros / 100;
    jurosMensalCalculado = ((1 + taxaAnualDecimal) ** (1 / 12) - 1) * 100;
  }

  const result = aporte * (1 + jurosMensalCalculado / 100) ** tempo;
  document.getElementById("Montante").value = "R$ " + result.toFixed(2);
  document.getElementById("resultado").innerText = `Montante estimado: ${result.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
  document.getElementById("resultado").classList.remove("d-none");

  const novaSimulacao = {
    dataHora: new Date().toLocaleString("pt-BR"),
    aporte: aporte,
    juros: juros,
    tempo: tempo,
    tipo: nomeTipoAmigavel,
    total: result
  };

  const historico = JSON.parse(localStorage.getItem(CHAVE_HISTORICO)) || [];
  historico.push(novaSimulacao);
  localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
  carregarHistorico();
}

function carregarHistorico() {
  const historico = JSON.parse(localStorage.getItem(CHAVE_HISTORICO)) || [];
  const tabela = document.getElementById("corpoTabela");
  tabela.innerHTML = "";

  historico.slice().reverse().forEach((item) => {
    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `
      <td><small class="text-muted">${item.dataHora || "---"}</small></td>
      <td>${Number(item.aporte).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
      <td>${item.juros}% (${item.tipo || "NOMINAL"})</td>
      <td>${item.tempo} meses</td>
      <td><strong>${Number(item.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></td>
    `;
    tabela.appendChild(novaLinha);
  });
}

function limparCampos() {
  document.getElementById("Aporte").value = "";
  document.getElementById("Juros").value = "";
  document.getElementById("Tempo").value = "";
  document.getElementById("Montante").value = "";
  document.getElementById("resultado").classList.add("d-none");
  document.getElementById("Aporte").classList.remove("is-invalid");
  document.getElementById("Juros").classList.remove("is-invalid");
  document.getElementById("Tempo").classList.remove("is-invalid");
}

function limparHistorico() {
  if (confirm("Tem certeza que deseja apagar todo o histórico de simulações?")) {
    localStorage.removeItem(CHAVE_HISTORICO);
    carregarHistorico();
  }
}
