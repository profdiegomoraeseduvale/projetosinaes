
// Script para calcular a nota de cada dimensão, CC total, gerar gráficos e listar indicadores com baixa pontuação

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
    <canvas id="graficoDimensoes" height="100"></canvas>
    <div id="indicadoresCriticos"></div>
  `;
  desenharGrafico(medias);
  listarCriticos();
}

function desenharGrafico(medias) {
  const ctx = document.getElementById('graficoDimensoes').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Dimensão 1', 'Dimensão 2', 'Dimensão 3'],
      datasets: [{
        label: 'Nota por Dimensão',
        data: [medias.dim1, medias.dim2, medias.dim3],
        backgroundColor: ['#007bff', '#28a745', '#ffc107']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 5
        }
      }
    }
  });
}

function listarCriticos() {
  const todos = document.querySelectorAll('input[type="radio"]:checked');
  const criticos = Array.from(todos).filter(input => !isNaN(input.value) && parseInt(input.value) < 3);
  const div = document.getElementById('indicadoresCriticos');
  div.innerHTML = '<h5>Indicadores com nota inferior a 3:</h5>';
  if (criticos.length === 0) {
    div.innerHTML += '<p>Nenhum indicador crítico.</p>';
  } else {
    const ul = document.createElement('ul');
    criticos.forEach(input => {
      const label = input.closest('tr').parentElement.parentElement.closest('.card').querySelector('button').innerText;
      const li = document.createElement('li');
      li.innerText = `${label} - Nota: ${input.value}`;
      ul.appendChild(li);
    });
    div.appendChild(ul);
  }
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
