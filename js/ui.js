(function () {
  const SESSION_KEY = 'orcamento_caixas_sessao';
  const LS_ITENS = 'orcamento_caixas_itens';
  const LS_FRETE = 'orcamento_caixas_frete';
  const LS_DESCONTO = 'orcamento_caixas_desconto_pct';
  const LS_CLIENTE_NOME = 'orcamento_caixas_cliente_nome';
  const LS_CLIENTE_CONTACTO = 'orcamento_caixas_cliente_contacto';

  /** @type {Array<object>} */
  let itensOrcamento = [];
  /** @type {Array<object>} */
  let opcoesAtual = [];

  const el = {
    loginScreen: document.getElementById('login-screen'),
    appScreen: document.getElementById('app-screen'),
    loginForm: document.getElementById('login-form'),
    loginPassword: document.getElementById('login-password'),
    loginError: document.getElementById('login-error'),
    simulacaoForm: document.getElementById('simulacao-form'),
    material: document.getElementById('campo-material'),
    comprimento: document.getElementById('campo-comprimento'),
    largura: document.getElementById('campo-largura'),
    altura: document.getElementById('campo-altura'),
    quantidade: document.getElementById('campo-quantidade'),
    resultadosLista: document.getElementById('resultados-lista'),
    resultadosVazio: document.getElementById('resultados-vazio'),
    chapaSelecionadaResumo: document.getElementById('chapa-selecionada-resumo'),
    btnAdicionar: document.getElementById('btn-adicionar-orcamento'),
    tabelaBody: document.getElementById('tabela-itens-body'),
    tabelaVazio: document.getElementById('tabela-itens-vazio'),
    displaySubtotal: document.getElementById('display-subtotal'),
    displayTotalGeral: document.getElementById('display-total-geral'),
    campoFrete: document.getElementById('campo-frete'),
    campoDesconto: document.getElementById('campo-desconto'),
    clienteNome: document.getElementById('cliente-nome'),
    clienteContacto: document.getElementById('cliente-contacto'),
    btnImprimir: document.getElementById('btn-imprimir-orcamento'),
  };

  function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  function formatarNumero(valor, casas = 4) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: casas,
    }).format(valor);
  }

  function novoId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function lerNumeroInput(input, padrao = 0) {
    const v = parseFloat(String(input.value).replace(',', '.'));
    if (!Number.isFinite(v)) return padrao;
    return v;
  }

  function carregarItensDoStorage() {
    try {
      const raw = localStorage.getItem(LS_ITENS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function guardarItensNoStorage() {
    localStorage.setItem(LS_ITENS, JSON.stringify(itensOrcamento));
  }

  function carregarExtras() {
    const frete = localStorage.getItem(LS_FRETE);
    const desconto = localStorage.getItem(LS_DESCONTO);
    const nome = localStorage.getItem(LS_CLIENTE_NOME);
    const contacto = localStorage.getItem(LS_CLIENTE_CONTACTO);
    if (frete !== null) el.campoFrete.value = frete;
    if (desconto !== null) el.campoDesconto.value = desconto;
    if (nome !== null) el.clienteNome.value = nome;
    if (contacto !== null) el.clienteContacto.value = contacto;
  }

  function guardarExtras() {
    localStorage.setItem(LS_FRETE, el.campoFrete.value);
    localStorage.setItem(LS_DESCONTO, el.campoDesconto.value);
    localStorage.setItem(LS_CLIENTE_NOME, el.clienteNome.value);
    localStorage.setItem(LS_CLIENTE_CONTACTO, el.clienteContacto.value);
  }

  function calcularSubtotal() {
    return itensOrcamento.reduce((acc, item) => acc + Number(item.precoTotal), 0);
  }

  function calcularTotalGeral() {
    const sub = calcularSubtotal();
    const frete = Math.max(0, lerNumeroInput(el.campoFrete, 0));
    let descontoPct = lerNumeroInput(el.campoDesconto, 0);
    if (descontoPct < 0) descontoPct = 0;
    if (descontoPct > 100) descontoPct = 100;
    return (sub + frete) * (1 - descontoPct / 100);
  }

  function atualizarPainelResumo() {
    const sub = calcularSubtotal();
    el.displaySubtotal.textContent = formatarMoeda(sub);
    el.displayTotalGeral.textContent = formatarMoeda(calcularTotalGeral());
  }

  function renderizarTabelaItens() {
    el.tabelaBody.innerHTML = '';
    if (itensOrcamento.length === 0) {
      el.tabelaVazio.classList.remove('hidden');
    } else {
      el.tabelaVazio.classList.add('hidden');
    }

    itensOrcamento.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50/80';
      tr.innerHTML = `
        <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-800">${index + 1}</td>
        <td class="px-4 py-3 text-slate-700">${escapeHtml(item.dimensoesLabel)}</td>
        <td class="px-4 py-3 text-slate-700">${escapeHtml(item.materialNome)}</td>
        <td class="whitespace-nowrap px-4 py-3 text-slate-800">${item.quantidade}</td>
        <td class="px-4 py-3 text-slate-700">${escapeHtml(item.chapaLabel)}</td>
        <td class="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">${formatarMoeda(item.precoUnitario)}</td>
        <td class="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">${formatarMoeda(item.precoTotal)}</td>
        <td class="print:hidden whitespace-nowrap px-4 py-3 text-right">
          <button
            type="button"
            class="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            data-remove-id="${escapeHtml(item.id)}"
          >
            Excluir
          </button>
        </td>
      `;
      el.tabelaBody.appendChild(tr);
    });

    el.tabelaBody.querySelectorAll('button[data-remove-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove-id');
        itensOrcamento = itensOrcamento.filter((i) => i.id !== id);
        guardarItensNoStorage();
        renderizarTabelaItens();
        atualizarPainelResumo();
      });
    });

    atualizarPainelResumo();
  }

  function estaAutenticado() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  function definirAutenticado() {
    sessionStorage.setItem(SESSION_KEY, '1');
  }

  function mostrarApp() {
    el.loginScreen.classList.add('hidden');
    el.appScreen.classList.remove('hidden');
  }

  function mostrarLogin() {
    el.appScreen.classList.add('hidden');
    el.loginScreen.classList.remove('hidden');
  }

  function preencherMateriais() {
    const itens = listarMateriaisParaSelect();
    el.material.innerHTML = itens
      .map((m) => `<option value="${m.id}">${escapeHtml(m.nome)}</option>`)
      .join('');
  }

  function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto == null ? '' : String(texto);
    return div.innerHTML;
  }

  function lerFormulario() {
    const comp = parseFloat(el.comprimento.value);
    const larg = parseFloat(el.largura.value);
    const alt = parseFloat(el.altura.value);
    const quantidade = parseInt(el.quantidade.value, 10);
    const material = el.material.value;
    return { comp, larg, alt, quantidade, material };
  }

  function validar(d) {
    if (!d.material) return 'Selecione um material.';
    if (!Number.isFinite(d.comp) || d.comp <= 0) return 'Comprimento inválido.';
    if (!Number.isFinite(d.larg) || d.larg <= 0) return 'Largura inválida.';
    if (!Number.isFinite(d.alt) || d.alt <= 0) return 'Altura inválida.';
    if (!Number.isInteger(d.quantidade) || d.quantidade < 1) return 'Quantidade deve ser um inteiro ≥ 1.';
    return null;
  }

  function limparFormularioSimulacao() {
    el.comprimento.value = '';
    el.largura.value = '';
    el.altura.value = '';
    el.quantidade.value = '1';
    if (el.material.options.length) {
      el.material.selectedIndex = 0;
    }
  }

  function limparAreaResultados() {
    opcoesAtual = [];
    el.resultadosLista.innerHTML = '';
    el.resultadosLista.classList.add('hidden');
    el.resultadosVazio.classList.remove('hidden');
    el.resultadosVazio.textContent =
      'Preencha o formulário e clique em "Simular melhor chapa" para ver as opções.';
    el.chapaSelecionadaResumo.textContent = '';
    el.btnAdicionar.disabled = true;
  }

  function definirEstadoBotaoAdicionar() {
    el.btnAdicionar.disabled = opcoesAtual.length === 0;
  }

  function renderizarOpcoes(opcoes) {
    opcoesAtual = opcoes;
    el.resultadosVazio.classList.add('hidden');
    el.resultadosLista.classList.remove('hidden');
    el.resultadosLista.innerHTML = '';

    opcoes.forEach((op, rank) => {
      const row = document.createElement('label');
      row.className =
        'flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-400 hover:shadow-md sm:flex-row sm:items-center sm:justify-between';
      row.innerHTML = `
        <div class="flex items-start gap-3">
          <input type="radio" name="chapa-escolhida" value="${op.indiceChapa}" class="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500" ${rank === 0 ? 'checked' : ''} />
          <div>
            <p class="font-semibold text-slate-800">#${rank + 1} — ${escapeHtml(op.dimensoesLabel)}</p>
            <p class="mt-1 text-sm text-slate-600">
              Cabem <strong>${op.maximoCaixas}</strong> caixa(s) por chapa
              (grade ${op.caixasL} × ${op.caixasC}) · Sobra/caixa: ${formatarNumero(op.sobraPorCaixa, 0)} mm²
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-4 text-sm sm:text-right">
          <div>
            <span class="text-slate-500">Unitário</span>
            <p class="text-lg font-bold text-amber-700">${formatarMoeda(op.precoUnitario)}</p>
          </div>
          <div>
            <span class="text-slate-500">Total (${op.quantidade} un.)</span>
            <p class="text-lg font-bold text-slate-800">${formatarMoeda(op.precoTotal)}</p>
          </div>
        </div>
      `;
      el.resultadosLista.appendChild(row);
    });

    const radios = el.resultadosLista.querySelectorAll('input[name="chapa-escolhida"]');
    radios.forEach((r) => {
      r.addEventListener('change', () => atualizarResumoSelecao(opcoes));
    });
    atualizarResumoSelecao(opcoes);
    definirEstadoBotaoAdicionar();
  }

  function atualizarResumoSelecao(opcoes) {
    const sel = el.resultadosLista.querySelector('input[name="chapa-escolhida"]:checked');
    if (!sel) {
      el.chapaSelecionadaResumo.textContent = '';
      return;
    }
    const idx = parseInt(sel.value, 10);
    const op = opcoes.find((o) => o.indiceChapa === idx);
    if (!op) return;
    el.chapaSelecionadaResumo.innerHTML = `
      Chapa escolhida: <strong>${escapeHtml(op.dimensoesLabel)}</strong> —
      ${op.maximoCaixas} caixa(s)/chapa · ${formatarMoeda(op.precoUnitario)} / un. ·
      <strong>${formatarMoeda(op.precoTotal)}</strong> total
    `;
  }

  function simular() {
    const d = lerFormulario();
    const erro = validar(d);
    el.resultadosLista.innerHTML = '';
    el.chapaSelecionadaResumo.textContent = '';
    opcoesAtual = [];
    el.btnAdicionar.disabled = true;

    if (erro) {
      el.resultadosVazio.classList.remove('hidden');
      el.resultadosLista.classList.add('hidden');
      el.resultadosVazio.textContent = erro;
      return;
    }

    const opcoes = listarOpcoesPorPrecoUnitario(d.comp, d.larg, d.alt, d.material, d.quantidade);

    if (opcoes.length === 0) {
      el.resultadosVazio.classList.remove('hidden');
      el.resultadosLista.classList.add('hidden');
      el.resultadosVazio.textContent =
        'Nenhuma chapa deste material comporta o molde com as medidas informadas. Ajuste as dimensões ou o material.';
      return;
    }

    el.resultadosVazio.classList.add('hidden');
    renderizarOpcoes(opcoes);
  }

  function obterOpcaoSelecionada() {
    const sel = el.resultadosLista.querySelector('input[name="chapa-escolhida"]:checked');
    if (!sel || opcoesAtual.length === 0) return null;
    const idx = parseInt(sel.value, 10);
    return opcoesAtual.find((o) => o.indiceChapa === idx) || null;
  }

  function adicionarSelecionadoAoOrcamento() {
    const op = obterOpcaoSelecionada();
    if (!op) return;

    const d = lerFormulario();
    if (validar(d)) return;

    const dimensoesLabel = `${Math.round(d.comp)} × ${Math.round(d.larg)} × ${Math.round(d.alt)}`;

    const item = {
      id: novoId(),
      comprimento: d.comp,
      largura: d.larg,
      altura: d.alt,
      dimensoesLabel,
      materialId: d.material,
      materialNome: op.materialNome,
      quantidade: d.quantidade,
      chapaLabel: op.dimensoesLabel,
      indiceChapa: op.indiceChapa,
      precoUnitario: op.precoUnitario,
      precoTotal: op.precoTotal,
    };

    itensOrcamento.push(item);
    guardarItensNoStorage();
    renderizarTabelaItens();

    limparFormularioSimulacao();
    limparAreaResultados();
  }

  el.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    el.loginError.classList.add('hidden');
    const senha = el.loginPassword.value;
    if (senha === APP_CONFIG.senhaPadrao) {
      definirAutenticado();
      el.loginPassword.value = '';
      mostrarApp();
    } else {
      el.loginError.textContent = 'Senha incorreta.';
      el.loginError.classList.remove('hidden');
    }
  });

  el.simulacaoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    simular();
  });

  el.btnAdicionar.addEventListener('click', () => {
    adicionarSelecionadoAoOrcamento();
  });

  el.campoFrete.addEventListener('input', () => {
    guardarExtras();
    atualizarPainelResumo();
  });
  el.campoDesconto.addEventListener('input', () => {
    guardarExtras();
    atualizarPainelResumo();
  });
  el.clienteNome.addEventListener('input', guardarExtras);
  el.clienteContacto.addEventListener('input', guardarExtras);

  el.btnImprimir.addEventListener('click', () => {
    window.print();
  });

  preencherMateriais();
  itensOrcamento = carregarItensDoStorage();
  carregarExtras();
  renderizarTabelaItens();

  if (estaAutenticado()) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
})();
