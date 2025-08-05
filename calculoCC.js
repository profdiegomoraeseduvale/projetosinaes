const pesos = { dim1: 30, dim2: 40, dim3: 30 };

function calcularMediaDimensao(nomeDimensao) {
  const inputs = document.querySelectorAll(`input[name^="${nomeDimensao}_"]:checked`);
  let total = 0;
  let count = 0;
  inputs.forEach(input => {
    if (input.value.toLowerCase() !== 'nsa') {
      total += parseInt(input.value);
      count++;
    }
  });
  return count > 0 ? total / count : 0;
}

function atualizarNomeAba(dimensao, media) {
  const aba = document.querySelector(`#${dimensao}-tab`);
  aba.innerText = aba.innerText.split(' - ')[0] + ` - ${media.toFixed(2)}`;
}

function calcularCC() {
  const medias = {
    dim1: calcularMediaDimensao('d1'),
    dim2: calcularMediaDimensao('d2'),
    dim3: calcularMediaDimensao('d3')
  };

  atualizarNomeAba('dim1', medias.dim1);
  atualizarNomeAba('dim2', medias.dim2);
  atualizarNomeAba('dim3', medias.dim3);

  const cc = ((medias.dim1 * pesos.dim1) + (medias.dim2 * pesos.dim2) + (medias.dim3 * pesos.dim3)) / 100;

  exibirResultados(medias, cc);
}

function exibirResultados(medias, cc) {
  const container = document.getElementById('resultadosContainer');
  container.innerHTML = `
    <h3>Nota Geral do Curso (CC): <strong>${cc.toFixed(2)}</strong></h3>
    <h4>Notas por Dimensão:</h4>
    <ul>
      <li>Dimensão 1: ${medias.dim1.toFixed(2)}</li>
      <li>Dimensão 2: ${medias.dim2.toFixed(2)}</li>
      <li>Dimensão 3: ${medias.dim3.toFixed(2)}</li>
    </ul>
    <canvas id="graficoIndicadores" height="120"></canvas>
    <div id="indicadoresCriticos"></div>
  `;
  desenharGraficoIndicadores();
  listarCriticos();
}

function desenharGraficoIndicadores() {
  const labels = []; // Lista de códigos dos indicadores (ex: "Indicador 1.1")
  const data = [];
  const cores = [];
  const descricoesCompletas = [];

  const inputs = document.querySelectorAll('input[type="radio"]:checked');
  inputs.forEach(input => {
    if (input.value.toLowerCase() !== 'nsa') {
      const card = input.closest('tr')
        .parentElement.parentElement
        .closest('.card');

      const indicadorCompleto = card.querySelector('button').innerText.trim();
      const titulo = indicadorCompleto.split(' - ')[0].trim();

      labels.push(titulo);
      descricoesCompletas.push(indicadorCompleto);

      const valor = parseInt(input.value);
      data.push(valor);
      cores.push(valor < 3 ? '#dc3545' : '#007bff');
    }
  });

  const ctx = document.getElementById('graficoIndicadores').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Nota por Indicador',
        data: data,
        backgroundColor: cores
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function(context) {
              const index = context[0].dataIndex;
              return descricoesCompletas[index];
            },
            label: function(context) {
              return `Nota: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          title: {
            display: true,
            text: 'Nota'
          }
        },
        x: {
          ticks: {
            display: false // ❌ Oculta os rótulos dos indicadores
          },
          title: {
            display: true,
            text: 'Indicadores' // ✅ Exibe apenas o título do eixo
          }
        }
      }
    }
  });
}

function listarCriticos() {
  const todos = document.querySelectorAll('input[type="radio"]:checked');
  const criticos = Array.from(todos).filter(input => !isNaN(input.value) && parseInt(input.value) < 3);
  const div = document.getElementById('indicadoresCriticos');
  div.innerHTML = '';

  const titulo = document.createElement('h5');
  titulo.textContent = 'Indicadores com nota inferior a 3:';
  div.appendChild(titulo);

  if (criticos.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'Nenhum indicador crítico.';
    div.appendChild(p);
  } else {
    const table = document.createElement('table');
    table.className = 'table table-bordered table-striped table-hover table-sm mt-2';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr class="table-danger text-center">
        <th style="width: 60%">Indicador</th>
        <th style="width: 40%">Nota</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    criticos.forEach(input => {
      const indicador = input.closest('tr')
        .parentElement.parentElement
        .closest('.card')
        .querySelector('button').innerText.trim();

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${indicador}</td>
        <td class="text-center">${input.value}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    div.appendChild(table);
  }
}

function salvarDados() {
  const selecionados = document.querySelectorAll('input[type="radio"]:checked');
  const dados = {
    nomeIes: document.getElementById('nomeIes').value,
    nomeCurso: document.getElementById('nomeCurso').value,
    respostas: Array.from(selecionados).map(input => ({
      name: input.name,
      value: input.value
    }))
  };

  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `avaliacao_${dados.nomeCurso || 'curso'}.json`;
  a.click();
}

function carregarDados(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const dados = JSON.parse(e.target.result);

    document.getElementById('nomeIes').value = dados.nomeIes || '';
    document.getElementById('nomeCurso').value = dados.nomeCurso || '';

    dados.respostas.forEach(item => {
      const input = document.querySelector(`input[name="${item.name}"][value="${item.value}"]`);
      if (input) input.checked = true;
    });

    Toastify({
      text: "✅ Dados carregados com sucesso!",
      duration: 4000,
      gravity: "top", // ou "bottom"
      position: "right", // ou "left", "center"
      backgroundColor: "#28a745", // verde Bootstrap
      stopOnFocus: true
    }).showToast();
  };

  reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', () => {
  const botao = document.createElement('button');
  botao.className = 'btn btn-success mt-3';
  botao.innerText = 'Calcular Resultados';
  botao.onclick = calcularCC;
  document.body.appendChild(botao);

  const abaResultados = document.createElement('div');
  abaResultados.className = 'tab-pane fade';
  abaResultados.id = 'resultados';
  abaResultados.innerHTML = '<div class="mt-3" id="resultadosContainer"></div>';
  document.getElementById('tabContent').appendChild(abaResultados);

  const liResultados = document.createElement('li');
  liResultados.className = 'nav-item';
  liResultados.innerHTML = '<button class="nav-link" id="resultados-tab" data-bs-toggle="tab" data-bs-target="#resultados" type="button" role="tab">Resultados</button>';
  document.getElementById('tabMenu').appendChild(liResultados);
});