(function () {
  const SESSION_KEY = 'orcamento_caixas_sessao';
  const LS_ITENS = 'orcamento_caixas_itens';
  const LS_FRETE = 'orcamento_caixas_frete';
  const LS_DESCONTO = 'orcamento_caixas_desconto_pct';
  const LS_CUSTO_FACA = 'orcamento_caixas_custo_faca';
  const LS_CUSTO_CLICHE = 'orcamento_caixas_custo_cliche';
  const LS_CLIENTE_NOME = 'orcamento_caixas_cliente_nome';
  const LS_CLIENTE_WHATSAPP = 'orcamento_caixas_cliente_whatsapp';
  const LS_CLIENTE_EMAIL = 'orcamento_caixas_cliente_email';
  const LS_CLIENTE_CNPJ = 'orcamento_caixas_cliente_cnpj';
  const LS_CLIENTE_ORIGEM = 'orcamento_caixas_cliente_origem';
  /** Legado: migra para e-mail se necessário */
  const LS_CLIENTE_CONTACTO = 'orcamento_caixas_cliente_contacto';

  const STATUS_PEDIDO = {
    ORCAMENTO_ENVIADO: 'orcamento-enviado',
    APROVADO_PAGO: 'aprovado-pago',
    EM_PRODUCAO: 'em-producao',
    PRONTO_ENTREGA: 'pronto-entrega',
    ENTREGUE: 'entregue',
  };

  const STATUS_PEDIDO_META = [
    {
      id: STATUS_PEDIDO.ORCAMENTO_ENVIADO,
      label: '🟡 Orçamento Enviado',
      badgeClass: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
    },
    {
      id: STATUS_PEDIDO.APROVADO_PAGO,
      label: '🟢 Aprovado/Pago',
      badgeClass: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200',
    },
    {
      id: STATUS_PEDIDO.EM_PRODUCAO,
      label: '🟠 Em Produção',
      badgeClass: 'bg-orange-100 text-orange-900 ring-1 ring-orange-200',
    },
    {
      id: STATUS_PEDIDO.PRONTO_ENTREGA,
      label: '🔵 Pronto para Entrega',
      badgeClass: 'bg-sky-100 text-sky-900 ring-1 ring-sky-200',
    },
    {
      id: STATUS_PEDIDO.ENTREGUE,
      label: '✅ Entregue',
      badgeClass: 'bg-violet-100 text-violet-900 ring-1 ring-violet-200',
    },
  ];

  const ORIGEM_CLIENTE_LABELS = {
    'site-organico': 'Site / Orgânico',
    indicacao: 'Indicação',
    'antigo-recorrente': 'Antigo / Recorrente',
    anuncios: 'Anúncios',
  };
  const LS_PEDIDO_TIPO_ENTREGA = 'orcamento_pedido_tipo_entrega';
  const LS_PEDIDO_DATA_ORCAMENTO = 'orcamento_pedido_data_orcamento';
  const LS_PEDIDO_EMPRESA = 'orcamento_pedido_empresa';
  const LS_PENDENCIAS_EMPRESA_FILTRO = 'orcamento_pendencias_empresa_filtro';

  const EMPRESA_CAIXAS_RIO = 'caixas-rio';
  const EMPRESA_CARTPEL = 'cartpel';

  const CONFIG_EMPRESAS = {
    [EMPRESA_CAIXAS_RIO]: {
      id: EMPRESA_CAIXAS_RIO,
      nomeCurto: 'Caixas Rio',
      siglaIdentificador: 'CAIXAS RIO',
      logoRelPath: 'assets/logos/caixas-rio.png',
      cnpj: '60.180.396/0001-28',
      endereco: 'Rua General José Joaquim Ferreira, 93, Pavuna',
      contatosLinhas: [
        'Contato: (21) 3452-3472',
        'Whatsapp: (21) 97218-2935',
        'E-mail: caixasrioembalagens@gmail.com',
      ],
      pagamento: {
        banco: 'Itaú',
        agencia: '5992',
        conta: '99764-2',
        favorecido: 'Caixas Rio Industria e Com. de Cartonagem LTDA',
        pix: '60180396000128',
      },
    },
    [EMPRESA_CARTPEL]: {
      id: EMPRESA_CARTPEL,
      nomeCurto: 'Cartpel',
      siglaIdentificador: 'CARTPEL',
      logoRelPath: 'assets/logos/cartpel.png',
      cnpj: '73.271.157/0001-25',
      endereco: 'Rua General José Joaquim Ferreira, 95, Pavuna',
      contatosLinhas: [
        'Contato: (21) 3452-3472',
        'Contato: (21) 2474-1070',
        'Whatsapp: (21) 980221325',
      ],
      pagamento: {
        banco: 'Itaú',
        agencia: '0229',
        conta: '389051',
        favorecido: 'Cartpel Industria e Com. de Cartonagem LTDA',
        pix: '73271157000125',
      },
    },
  };
  const LS_PROXIMO_NUMERO_ORCAMENTO = 'orcamento_caixas_proximo_numero';
  const LS_HISTORICO_ORCAMENTOS = 'historico_caixas_rio';
  const LS_CLIENTES_CRM = 'clientes_cadastrados_rio';

  const DIAS_VALIDADE_PADRAO = 5;
  const DIAS_VALIDADE_DUPLICACAO = 10;

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
    displayValorDesconto: document.getElementById('display-valor-desconto'),
    displaySubtotalLiquido: document.getElementById('display-subtotal-liquido'),
    displayTotalGeral: document.getElementById('display-total-geral'),
    printContainer: document.getElementById('print-container'),
    campoFrete: document.getElementById('campo-frete'),
    campoCustoFaca: document.getElementById('campo-custo-faca'),
    campoCustoCliche: document.getElementById('campo-custo-cliche'),
    campoDesconto: document.getElementById('campo-desconto'),
    clienteNome: document.getElementById('cliente-nome'),
    clientesDatalist: document.getElementById('clientes-cadastrados-datalist'),
    clienteWhatsapp: document.getElementById('cliente-whatsapp'),
    clienteEmail: document.getElementById('cliente-email'),
    clienteCnpj: document.getElementById('cliente-cnpj'),
    clienteOrigem: document.getElementById('cliente-origem'),
    pedidoTipoEntrega: document.getElementById('pedido-tipo-entrega'),
    pedidoEmpresa: document.getElementById('pedido-empresa'),
    pedidoDataOrcamento: document.getElementById('pedido-data-orcamento'),
    pedidoValidadeTexto: document.getElementById('pedido-validade-texto'),
    btnImprimir: document.getElementById('btn-imprimir-orcamento'),
    btnImprimirOP: document.getElementById('btn-imprimir-op'),
    opContainer: document.getElementById('op-container'),
    btnLimparOrcamento: document.getElementById('btn-limpar-dados-orcamento'),
    btnSalvarOrcamentoHistorico: document.getElementById('btn-salvar-orcamento-historico'),
    historicoBusca: document.getElementById('historico-busca'),
    historicoTbody: document.getElementById('historico-tbody'),
    historicoVazio: document.getElementById('historico-vazio'),
    historicoMsgFeedback: document.getElementById('historico-msg-feedback'),
    secaoHistorico: document.getElementById('secao-historico-orcamentos'),
    dashboardPeriodoTipo: document.getElementById('dashboard-periodo-tipo'),
    dashboardMesRef: document.getElementById('dashboard-mes-ref'),
    dashboardAnoRef: document.getElementById('dashboard-ano-ref'),
    dashboardWrapMes: document.getElementById('dashboard-wrap-mes'),
    dashboardWrapAno: document.getElementById('dashboard-wrap-ano'),
    dashboardGraficoEscala: document.getElementById('dashboard-grafico-escala'),
    dashboardEmpresaFiltro: document.getElementById('dashboard-empresa-filtro'),
    dashboardCardsGrid: document.getElementById('dashboard-cards-grid'),
    dashboardOrigemResumo: document.getElementById('dashboard-origem-resumo'),
    dashboardTemposMedios: document.getElementById('dashboard-tempos-medios'),
    dashboardChartCanvas: document.getElementById('dashboard-chart-canvas'),
    dashboardChartVazio: document.getElementById('dashboard-chart-vazio'),
    dashboardMetricasDetails: document.getElementById('dashboard-metricas-details'),
    dashboardRankingLista: document.getElementById('dashboard-ranking-lista'),
    painelPendencias: document.getElementById('painel-pendencias'),
    pendenciasOpCount: document.getElementById('pendencias-op-count'),
    pendenciasOpLista: document.getElementById('pendencias-op-lista'),
    pendenciasRetiradaCount: document.getElementById('pendencias-retirada-count'),
    pendenciasAtrasoCount: document.getElementById('pendencias-atraso-count'),
    pendenciasAtrasoLista: document.getElementById('pendencias-atraso-lista'),
    pendenciasEmpresaFiltro: document.getElementById('pendencias-empresa-filtro'),
    listaPendenciasDetalhada: document.getElementById('lista-pendencias-detalhada'),
    painelParams: document.getElementById('painel-config-parametros'),
    painelChapas: document.getElementById('painel-config-chapas'),
    btnSalvarConfig: document.getElementById('btn-salvar-config'),
    configMsgFeedback: document.getElementById('config-msg-feedback'),
  };

  function validarIdEmpresa(id) {
    return id === EMPRESA_CARTPEL ? EMPRESA_CARTPEL : EMPRESA_CAIXAS_RIO;
  }

  function obterConfigEmpresa(id) {
    return CONFIG_EMPRESAS[validarIdEmpresa(id)];
  }

  function obterEmpresaSelecionada() {
    if (el.pedidoEmpresa && el.pedidoEmpresa.value) return validarIdEmpresa(el.pedidoEmpresa.value);
    return EMPRESA_CAIXAS_RIO;
  }

  function montarIdentificadorBasePedido(empresaId, nomeCliente, numeroSequencial) {
    const cfg = obterConfigEmpresa(empresaId);
    const n = Math.max(1, Math.floor(Number(numeroSequencial)) || 1);
    const nome = (nomeCliente && String(nomeCliente).trim()) || 'Sem nome';
    return `${cfg.siglaIdentificador} - ${nome} - #${String(n).padStart(3, '0')}`;
  }

  function identificadorBaseTemSiglaEmpresa(base) {
    if (!base || typeof base !== 'string') return false;
    const b = base.trim();
    return Object.keys(CONFIG_EMPRESAS).some((k) => b.startsWith(`${CONFIG_EMPRESAS[k].siglaIdentificador} - `));
  }

  function migrarIdentificadorBaseParaSigla(entry) {
    if (!entry || !entry.identificadorBase || typeof entry.identificadorBase !== 'string') return;
    if (identificadorBaseTemSiglaEmpresa(entry.identificadorBase)) return;
    const sem = entry.identificadorBase.trim();
    const match = sem.match(/^(.*?)\s*-\s*#(\d{3})$/);
    if (match) {
      const nome = (match[1] && match[1].trim()) || 'Sem nome';
      const num = parseInt(match[2], 10);
      entry.identificadorBase = montarIdentificadorBasePedido(entry.empresa, nome, num);
    }
  }

  function atualizarSecaoPagamentoEmpresaNaTela() {
    /* Dados de pagamento só no PDF; painel na página foi removido. */
  }

  function obterMetaStatusPedido(statusId) {
    return STATUS_PEDIDO_META.find((s) => s.id === statusId) || STATUS_PEDIDO_META[0];
  }

  function montarIdentificadorComStatus(identificadorBase, statusId) {
    const meta = obterMetaStatusPedido(statusId);
    return `${identificadorBase} · ${meta.label}`;
  }

  function textoOrigemCliente(chave) {
    return ORIGEM_CLIENTE_LABELS[chave] || ORIGEM_CLIENTE_LABELS['site-organico'];
  }

  function statusContaComoVendido(statusId) {
    return statusId && statusId !== STATUS_PEDIDO.ORCAMENTO_ENVIADO;
  }

  function normalizarEntradaHistorico(e) {
    if (!e || typeof e !== 'object') return e;
    if (!e.status) e.status = STATUS_PEDIDO.ORCAMENTO_ENVIADO;
    if (!e.origemCliente || !ORIGEM_CLIENTE_LABELS[e.origemCliente]) {
      e.origemCliente = 'site-organico';
    }
    const empRaw = e.empresa || (e.pedido && e.pedido.empresa);
    e.empresa = validarIdEmpresa(empRaw || EMPRESA_CAIXAS_RIO);
    if (!e.milestones || typeof e.milestones !== 'object') e.milestones = {};
    if (!e.milestones.orcamentoEnviadoEm && e.criadoEm) {
      e.milestones.orcamentoEnviadoEm = e.criadoEm;
    }
    if (!e.identificadorBase) {
      if (e.identificador && String(e.identificador).includes('·')) {
        e.identificadorBase = String(e.identificador)
          .split('·')[0]
          .trim();
      } else {
        e.identificadorBase =
          e.identificador ||
          montarIdentificadorBasePedido(
            e.empresa,
            (e.cliente && e.cliente.nome) || 'Sem nome',
            e.numeroSequencial || 1
          );
      }
    }
    migrarIdentificadorBaseParaSigla(e);
    e.identificador = montarIdentificadorComStatus(e.identificadorBase, e.status);
    if (typeof e.followUpDismissed !== 'boolean') e.followUpDismissed = false;
    return e;
  }

  function aplicarMilestonesAoStatus(entry, novoStatus) {
    const now = new Date().toISOString();
    const m = entry.milestones && typeof entry.milestones === 'object' ? { ...entry.milestones } : {};
    if (!m.orcamentoEnviadoEm) {
      m.orcamentoEnviadoEm = entry.criadoEm || now;
    }
    switch (novoStatus) {
      case STATUS_PEDIDO.ORCAMENTO_ENVIADO:
        if (!m.orcamentoEnviadoEm) m.orcamentoEnviadoEm = now;
        break;
      case STATUS_PEDIDO.APROVADO_PAGO:
        if (!m.aprovadoEm) m.aprovadoEm = now;
        break;
      case STATUS_PEDIDO.EM_PRODUCAO:
        if (!m.emProducaoEm) m.emProducaoEm = now;
        break;
      case STATUS_PEDIDO.PRONTO_ENTREGA:
        if (!m.prontoEntregaEm) m.prontoEntregaEm = now;
        break;
      case STATUS_PEDIDO.ENTREGUE:
        if (!m.entregueEm) m.entregueEm = now;
        break;
      default:
        break;
    }
    entry.milestones = m;
    entry.status = novoStatus;
    if (!entry.identificadorBase && entry.identificador) {
      entry.identificadorBase = String(entry.identificador).includes('·')
        ? String(entry.identificador)
            .split('·')[0]
            .trim()
        : String(entry.identificador).trim();
    }
    if (entry.identificadorBase) {
      migrarIdentificadorBaseParaSigla(entry);
      entry.identificador = montarIdentificadorComStatus(entry.identificadorBase, novoStatus);
    }
  }

  function formatarDuracaoMedia(ms) {
    if (!Number.isFinite(ms) || ms < 0) return '—';
    const h = Math.floor(ms / 3600000);
    const d = Math.floor(h / 24);
    const hr = h % 24;
    if (d > 0) return `${d} dia(s) e ${hr} h`;
    if (h > 0) return `${h} h`;
    const m = Math.floor(ms / 60000);
    return `${m} min`;
  }

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

  function dataHojeISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function parseDataISO(str) {
    if (!str || typeof str !== 'string') return null;
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
  }

  function formatarDataBR(dt) {
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function adicionarDiasCorridos(dataISO, dias) {
    const dt = parseDataISO(dataISO);
    if (!dt) return null;
    dt.setDate(dt.getDate() + dias);
    return dt;
  }

  /**
   * Avança a data ignorando sábados e domingos.
   */
  function adicionarDiasUteis(dataRef, diasUteis) {
    const d = new Date(dataRef);
    if (Number.isNaN(d.getTime())) return new Date();
    let restantes = Math.max(0, Math.floor(Number(diasUteis)) || 0);
    while (restantes > 0) {
      d.setDate(d.getDate() + 1);
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) restantes -= 1;
    }
    return d;
  }

  function dataParaISO(d) {
    if (!d || Number.isNaN(d.getTime())) return dataHojeISO();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function atualizarTextoValidadeOrcamento(diasValidade = DIAS_VALIDADE_PADRAO) {
    if (!el.pedidoValidadeTexto || !el.pedidoDataOrcamento) return;
    const iso = el.pedidoDataOrcamento.value || dataHojeISO();
    const fim = adicionarDiasCorridos(iso, diasValidade);
    if (!fim) {
      el.pedidoValidadeTexto.textContent = '—';
      return;
    }
    el.pedidoValidadeTexto.textContent = `Este orçamento é válido até dia ${formatarDataBR(fim)}.`;
  }

  function lerClientesCRM() {
    try {
      const raw = localStorage.getItem(LS_CLIENTES_CRM);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function gravarClientesCRM(lista) {
    localStorage.setItem(LS_CLIENTES_CRM, JSON.stringify(lista));
  }

  function chaveNomeCliente(nome) {
    return String(nome || '')
      .trim()
      .toLowerCase();
  }

  function popularDatalistClientes() {
    if (!el.clientesDatalist) return;
    const lista = lerClientesCRM();
    el.clientesDatalist.innerHTML = lista
      .map((c) => {
        const v = escapeHtml(c.nome || '');
        return `<option value="${v}"></option>`;
      })
      .join('');
  }

  function registrarClienteCRMDeEntry(entry) {
    const nome = entry.cliente && entry.cliente.nome ? String(entry.cliente.nome).trim() : '';
    if (!nome) return;
    const key = chaveNomeCliente(nome);
    let lista = lerClientesCRM();
    const existente = lista.find((c) => chaveNomeCliente(c.nome) === key);
    const reg = {
      nome,
      nomeLower: key,
      whatsapp: entry.cliente.whatsapp || '',
      email: entry.cliente.email || '',
      cnpj: entry.cliente.cnpj || '',
    };
    if (existente) {
      existente.whatsapp = reg.whatsapp || existente.whatsapp;
      existente.email = reg.email || existente.email;
      existente.cnpj = reg.cnpj || existente.cnpj;
      existente.nome = nome;
    } else {
      lista.push(reg);
    }
    gravarClientesCRM(lista);
    popularDatalistClientes();
  }

  function preencherClientePorNomeDigitado() {
    if (!el.clienteNome) return;
    const nome = el.clienteNome.value.trim();
    if (!nome) return;
    const key = chaveNomeCliente(nome);
    const lista = lerClientesCRM();
    const c = lista.find((x) => x.nomeLower === key);
    if (!c) return;
    if (el.clienteWhatsapp && c.whatsapp) el.clienteWhatsapp.value = c.whatsapp;
    if (el.clienteEmail && c.email) el.clienteEmail.value = c.email;
    if (el.clienteCnpj && c.cnpj) el.clienteCnpj.value = c.cnpj;
    guardarExtras();
  }

  function pedidoEstaAtrasado(e) {
    const st = e.status;
    if (
      st !== STATUS_PEDIDO.APROVADO_PAGO &&
      st !== STATUS_PEDIDO.EM_PRODUCAO &&
      st !== STATUS_PEDIDO.PRONTO_ENTREGA
    ) {
      return false;
    }
    if (!e.dataPrometidaProducao) return false;
    const prazo = parseDataISO(e.dataPrometidaProducao);
    if (!prazo) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    prazo.setHours(0, 0, 0, 0);
    return hoje > prazo;
  }

  function precisaFollowUpOrcamento(e) {
    if (e.status !== STATUS_PEDIDO.ORCAMENTO_ENVIADO) return false;
    if (e.followUpDismissed) return false;
    if (!e.criadoEm) return false;
    const d = new Date(e.criadoEm);
    if (Number.isNaN(d.getTime())) return false;
    const diffDias = (Date.now() - d.getTime()) / 86400000;
    return diffDias > 3;
  }

  let pendenciasEmpresaFiltroCarregado = false;

  function garantirFiltroPendenciasEmpresaDoStorage() {
    if (!el.pendenciasEmpresaFiltro || pendenciasEmpresaFiltroCarregado) return;
    const saved = localStorage.getItem(LS_PENDENCIAS_EMPRESA_FILTRO);
    if (saved === 'todas' || saved === EMPRESA_CAIXAS_RIO || saved === EMPRESA_CARTPEL) {
      el.pendenciasEmpresaFiltro.value = saved;
    }
    pendenciasEmpresaFiltroCarregado = true;
  }

  function obterFiltroEmpresaPendencias() {
    if (!el.pendenciasEmpresaFiltro) return 'todas';
    const v = el.pendenciasEmpresaFiltro.value;
    if (v === EMPRESA_CARTPEL || v === EMPRESA_CAIXAS_RIO) return v;
    return 'todas';
  }

  function filtrarHistoricoPorEmpresaPendencias(lista) {
    const f = obterFiltroEmpresaPendencias();
    if (f === 'todas') return lista;
    return lista.filter((e) => validarIdEmpresa(e.empresa) === f);
  }

  function diffDiasCorridosMeiaNoite(inicio, fim) {
    const a = new Date(inicio);
    if (Number.isNaN(a.getTime())) return 0;
    a.setHours(0, 0, 0, 0);
    const b = new Date(fim);
    if (Number.isNaN(b.getTime())) return 0;
    b.setHours(0, 0, 0, 0);
    return Math.floor((b.getTime() - a.getTime()) / 86400000);
  }

  function obterIsoEntradaStatusAtual(entry) {
    const m = entry.milestones && typeof entry.milestones === 'object' ? entry.milestones : {};
    const st = entry.status;
    if (st === STATUS_PEDIDO.APROVADO_PAGO) return m.aprovadoEm || m.orcamentoEnviadoEm || entry.criadoEm;
    if (st === STATUS_PEDIDO.EM_PRODUCAO) return m.emProducaoEm || m.aprovadoEm || entry.criadoEm;
    if (st === STATUS_PEDIDO.PRONTO_ENTREGA) return m.prontoEntregaEm || m.emProducaoEm || entry.criadoEm;
    return entry.criadoEm;
  }

  function diasDesdeEntradaNoStatusAtual(entry) {
    const iso = obterIsoEntradaStatusAtual(entry);
    if (!iso) return 0;
    const d0 = new Date(iso);
    if (Number.isNaN(d0.getTime())) return 0;
    return Math.max(0, diffDiasCorridosMeiaNoite(d0, new Date()));
  }

  function diasAtrasoAlemDoPrazoProducao(entry) {
    if (!pedidoEstaAtrasado(entry)) return 0;
    const prazo = parseDataISO(entry.dataPrometidaProducao);
    if (!prazo) return 0;
    return Math.max(0, diffDiasCorridosMeiaNoite(prazo, new Date()));
  }

  /** Maior entre espera no status atual e dias após o prazo de produção (quando aplicável). */
  function prioridadeUrgenciaPendenciaDias(entry) {
    return Math.max(diasDesdeEntradaNoStatusAtual(entry), diasAtrasoAlemDoPrazoProducao(entry));
  }

  function entryApareceNaListaPrioridadesPendencias(e) {
    const st = e.status;
    return (
      st === STATUS_PEDIDO.APROVADO_PAGO ||
      st === STATUS_PEDIDO.EM_PRODUCAO ||
      st === STATUS_PEDIDO.PRONTO_ENTREGA
    );
  }

  function extrairNumeroPedidoCurto(entry) {
    const n = entry.numeroSequencial;
    if (Number.isFinite(Number(n)) && Number(n) >= 1) {
      return `#${String(Math.floor(Number(n))).padStart(3, '0')}`;
    }
    const base = entry.identificadorBase || entry.identificador || '';
    const m = String(base).match(/#(\d{3})/);
    return m ? `#${m[1]}` : '—';
  }

  function textoPendenciaAtrasoOuAguardando(entry) {
    const diasAtraso = diasAtrasoAlemDoPrazoProducao(entry);
    if (diasAtraso > 0) {
      return {
        classe: 'text-red-200',
        texto: `🔴 Atrasado há ${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'}`,
      };
    }
    const diasEsp = diasDesdeEntradaNoStatusAtual(entry);
    if (diasEsp === 0) {
      return { classe: 'text-sky-200', texto: '🔵 Aguardando desde hoje' };
    }
    return {
      classe: 'text-sky-200',
      texto: `🔵 Aguardando há ${diasEsp} ${diasEsp === 1 ? 'dia' : 'dias'}`,
    };
  }

  function renderizarListaPrioridadesPendencias(todosFiltrados) {
    if (!el.listaPendenciasDetalhada) return;
    const pendentes = todosFiltrados.filter((e) => entryApareceNaListaPrioridadesPendencias(e));
    if (pendentes.length === 0) {
      el.listaPendenciasDetalhada.innerHTML =
        '<li class="rounded-lg border border-slate-600/50 bg-slate-950/40 px-3 py-2 text-sm text-slate-400">Nenhuma pendência operacional neste filtro.</li>';
      return;
    }
    const ordenados = [...pendentes].sort(
      (a, b) => prioridadeUrgenciaPendenciaDias(b) - prioridadeUrgenciaPendenciaDias(a)
    );
    el.listaPendenciasDetalhada.innerHTML = ordenados
      .map((e) => {
        const cfgEmp = obterConfigEmpresa(e.empresa);
        const emp = escapeHtml(cfgEmp.nomeCurto);
        const cliente = escapeHtml((e.cliente && e.cliente.nome) || '—');
        const num = escapeHtml(extrairNumeroPedidoCurto(e));
        const meta = obterMetaStatusPedido(e.status);
        const stLabel = escapeHtml(meta.label);
        const { classe, texto } = textoPendenciaAtrasoOuAguardando(e);
        const urg = prioridadeUrgenciaPendenciaDias(e);
        const idAttr = escapeHtml(e.id);
        return `<li class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-600/60 bg-slate-950/50 px-3 py-2 text-xs leading-snug text-slate-200" data-pendencia-dias="${urg}">
          <div class="min-w-0 flex flex-1 flex-wrap items-baseline gap-x-2 gap-y-1">
            <span class="font-semibold text-amber-100/95">[${emp}]</span>
            <span class="text-slate-100">${cliente} ${num}</span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-300">${stLabel}</span>
            <span class="text-slate-400">|</span>
            <span class="${classe} font-medium">${texto}</span>
          </div>
          <button type="button" class="shrink-0 rounded-lg border border-sky-400/60 bg-sky-500/20 px-2.5 py-1 text-[11px] font-semibold text-sky-100 transition hover:bg-sky-500/35" data-pendencia-carregar="${idAttr}">Carregar</button>
        </li>`;
      })
      .join('');
  }

  function renderizarPainelPendencias() {
    if (!el.pendenciasOpCount || !el.pendenciasOpLista) return;
    garantirFiltroPendenciasEmpresaDoStorage();
    const todos = filtrarHistoricoPorEmpresaPendencias(lerHistoricoOrcamentos());
    const aguardandoOp = todos
      .filter((e) => e.status === STATUS_PEDIDO.APROVADO_PAGO)
      .sort((a, b) => prioridadeUrgenciaPendenciaDias(b) - prioridadeUrgenciaPendenciaDias(a));
    el.pendenciasOpCount.textContent = String(aguardandoOp.length);
    el.pendenciasOpLista.innerHTML = aguardandoOp
      .slice(0, 12)
      .map((e) => {
        const id = escapeHtml(e.identificadorBase || e.identificador || '—');
        const nome = escapeHtml((e.cliente && e.cliente.nome) || '—');
        return `<li class="truncate border-l-2 border-amber-500/50 pl-2">${id} — ${nome}</li>`;
      })
      .join('');
    if (!aguardandoOp.length) {
      el.pendenciasOpLista.innerHTML = '<li class="text-slate-500">Nenhum.</li>';
    }

    const retirada = todos.filter((e) => e.status === STATUS_PEDIDO.PRONTO_ENTREGA).length;
    if (el.pendenciasRetiradaCount) el.pendenciasRetiradaCount.textContent = String(retirada);

    const atrasados = todos.filter((e) => pedidoEstaAtrasado(e));
    if (el.pendenciasAtrasoCount) el.pendenciasAtrasoCount.textContent = String(atrasados.length);
    if (el.pendenciasAtrasoLista) {
      el.pendenciasAtrasoLista.innerHTML = atrasados
        .sort((a, b) => prioridadeUrgenciaPendenciaDias(b) - prioridadeUrgenciaPendenciaDias(a))
        .slice(0, 12)
        .map((e) => {
          const id = escapeHtml(e.identificadorBase || e.identificador || '—');
          const prev = e.dataPrometidaProducao ? escapeHtml(formatarDataBR(parseDataISO(e.dataPrometidaProducao))) : '—';
          return `<li class="truncate border-l-2 border-red-400/60 pl-2">Prev. ${prev}: ${id}</li>`;
        })
        .join('');
      if (!atrasados.length) {
        el.pendenciasAtrasoLista.innerHTML = '<li class="text-emerald-200/80">Nenhum atraso no prazo.</li>';
      }
    }

    renderizarListaPrioridadesPendencias(todos);
  }

  function carregarExtras() {
    const frete = localStorage.getItem(LS_FRETE);
    const desconto = localStorage.getItem(LS_DESCONTO);
    const custoFaca = localStorage.getItem(LS_CUSTO_FACA);
    const custoCliche = localStorage.getItem(LS_CUSTO_CLICHE);
    const nome = localStorage.getItem(LS_CLIENTE_NOME);
    const whats = localStorage.getItem(LS_CLIENTE_WHATSAPP);
    const email = localStorage.getItem(LS_CLIENTE_EMAIL);
    const cnpj = localStorage.getItem(LS_CLIENTE_CNPJ);
    const legadoContacto = localStorage.getItem(LS_CLIENTE_CONTACTO);
    const tipoEnt = localStorage.getItem(LS_PEDIDO_TIPO_ENTREGA);
    const dataOrc = localStorage.getItem(LS_PEDIDO_DATA_ORCAMENTO);

    if (frete !== null) el.campoFrete.value = frete;
    if (desconto !== null) el.campoDesconto.value = desconto;
    if (custoFaca !== null && el.campoCustoFaca) el.campoCustoFaca.value = custoFaca;
    if (custoCliche !== null && el.campoCustoCliche) el.campoCustoCliche.value = custoCliche;
    if (nome !== null) el.clienteNome.value = nome;
    if (whats !== null && el.clienteWhatsapp) el.clienteWhatsapp.value = whats;
    if (email !== null && el.clienteEmail) el.clienteEmail.value = email;
    if (cnpj !== null && el.clienteCnpj) el.clienteCnpj.value = cnpj;
    const origem = localStorage.getItem(LS_CLIENTE_ORIGEM);
    if (el.clienteOrigem && origem && ORIGEM_CLIENTE_LABELS[origem]) {
      el.clienteOrigem.value = origem;
    }

    if (el.clienteEmail && !el.clienteEmail.value && legadoContacto) {
      el.clienteEmail.value = legadoContacto;
    }

    if (el.pedidoTipoEntrega && tipoEnt !== null) el.pedidoTipoEntrega.value = tipoEnt;
    const empLs = localStorage.getItem(LS_PEDIDO_EMPRESA);
    if (el.pedidoEmpresa) {
      if (empLs && (empLs === EMPRESA_CAIXAS_RIO || empLs === EMPRESA_CARTPEL)) {
        el.pedidoEmpresa.value = empLs;
      } else if (!el.pedidoEmpresa.value) {
        el.pedidoEmpresa.value = EMPRESA_CAIXAS_RIO;
      }
    }
    if (el.pedidoDataOrcamento) {
      if (dataOrc !== null && dataOrc !== '') {
        el.pedidoDataOrcamento.value = dataOrc;
      } else if (!el.pedidoDataOrcamento.value) {
        el.pedidoDataOrcamento.value = dataHojeISO();
      }
    }
    atualizarTextoValidadeOrcamento(DIAS_VALIDADE_PADRAO);
    atualizarSecaoPagamentoEmpresaNaTela();
  }

  function guardarExtras() {
    localStorage.setItem(LS_FRETE, el.campoFrete.value);
    localStorage.setItem(LS_DESCONTO, el.campoDesconto.value);
    if (el.campoCustoFaca) localStorage.setItem(LS_CUSTO_FACA, el.campoCustoFaca.value);
    if (el.campoCustoCliche) localStorage.setItem(LS_CUSTO_CLICHE, el.campoCustoCliche.value);
    localStorage.setItem(LS_CLIENTE_NOME, el.clienteNome.value);
    if (el.clienteWhatsapp) localStorage.setItem(LS_CLIENTE_WHATSAPP, el.clienteWhatsapp.value);
    if (el.clienteEmail) localStorage.setItem(LS_CLIENTE_EMAIL, el.clienteEmail.value);
    if (el.clienteCnpj) localStorage.setItem(LS_CLIENTE_CNPJ, el.clienteCnpj.value);
    if (el.clienteOrigem) localStorage.setItem(LS_CLIENTE_ORIGEM, el.clienteOrigem.value);
    if (el.pedidoTipoEntrega) localStorage.setItem(LS_PEDIDO_TIPO_ENTREGA, el.pedidoTipoEntrega.value);
    if (el.pedidoDataOrcamento) localStorage.setItem(LS_PEDIDO_DATA_ORCAMENTO, el.pedidoDataOrcamento.value);
    if (el.pedidoEmpresa) localStorage.setItem(LS_PEDIDO_EMPRESA, el.pedidoEmpresa.value);
  }

  function limparDadosOrcamentoComercial() {
    if (
      !window.confirm(
        'Limpar dados do orçamento? Serão apagados cliente, informações do pedido, itens da tabela, simulação e frete/desconto. As configurações de materiais não serão alteradas.'
      )
    ) {
      return;
    }

    if (el.clienteNome) el.clienteNome.value = '';
    if (el.clienteWhatsapp) el.clienteWhatsapp.value = '';
    if (el.clienteEmail) el.clienteEmail.value = '';
    if (el.clienteCnpj) el.clienteCnpj.value = '';
    if (el.clienteOrigem) el.clienteOrigem.value = 'site-organico';
    if (el.pedidoTipoEntrega) el.pedidoTipoEntrega.selectedIndex = 0;
    if (el.pedidoEmpresa) el.pedidoEmpresa.value = EMPRESA_CAIXAS_RIO;
    if (el.pedidoDataOrcamento) el.pedidoDataOrcamento.value = dataHojeISO();
    atualizarTextoValidadeOrcamento();
    atualizarSecaoPagamentoEmpresaNaTela();

    el.campoFrete.value = '0';
    el.campoDesconto.value = '0';
    if (el.campoCustoFaca) el.campoCustoFaca.value = '0';
    if (el.campoCustoCliche) el.campoCustoCliche.value = '0';

    itensOrcamento = [];
    guardarItensNoStorage();
    renderizarTabelaItens();

    limparFormularioSimulacao();
    limparAreaResultados();

    guardarExtras();
  }

  function lerProximoNumeroOrcamento() {
    const raw = localStorage.getItem(LS_PROXIMO_NUMERO_ORCAMENTO);
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) return 1;
    return n;
  }

  function gravarProximoNumeroOrcamento(n) {
    const v = Math.max(1, Math.floor(Number(n)) || 1);
    localStorage.setItem(LS_PROXIMO_NUMERO_ORCAMENTO, String(v));
  }

  function lerHistoricoOrcamentos() {
    try {
      const raw = localStorage.getItem(LS_HISTORICO_ORCAMENTOS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((e) => normalizarEntradaHistorico(e));
    } catch {
      return [];
    }
  }

  function gravarHistoricoOrcamentos(lista) {
    localStorage.setItem(LS_HISTORICO_ORCAMENTOS, JSON.stringify(lista));
  }

  function formatarDataHoraHistorico(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  /** Data e hora em duas linhas (apenas dígitos formatados — seguro para innerHTML). */
  function formatarDataHoraHistoricoCelulaHtml(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const data = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const hora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `<div class="leading-tight"><span class="block whitespace-nowrap">${data}</span><span class="block whitespace-nowrap text-xs text-slate-500">${hora}</span></div>`;
  }

  function mostrarFeedbackHistorico(msg) {
    if (!el.historicoMsgFeedback) return;
    el.historicoMsgFeedback.textContent = msg;
    el.historicoMsgFeedback.classList.remove('hidden');
    window.clearTimeout(mostrarFeedbackHistorico._t);
    mostrarFeedbackHistorico._t = window.setTimeout(() => {
      el.historicoMsgFeedback.classList.add('hidden');
    }, 5000);
  }

  function filtrarHistoricoPeriodoDashboard(lista) {
    if (!el.dashboardPeriodoTipo) return lista;
    const tipo = el.dashboardPeriodoTipo.value;
    if (tipo === 'todos') return lista;
    if (tipo === 'mes' && el.dashboardMesRef && el.dashboardMesRef.value) {
      const pref = el.dashboardMesRef.value;
      return lista.filter((e) => {
        if (!e.criadoEm) return false;
        const d = new Date(e.criadoEm);
        if (Number.isNaN(d.getTime())) return false;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}` === pref;
      });
    }
    if (tipo === 'ano' && el.dashboardAnoRef && el.dashboardAnoRef.value !== '') {
      const ySel = parseInt(el.dashboardAnoRef.value, 10);
      return lista.filter((e) => {
        if (!e.criadoEm) return false;
        const d = new Date(e.criadoEm);
        return !Number.isNaN(d.getTime()) && d.getFullYear() === ySel;
      });
    }
    return lista;
  }

  function filtrarHistoricoEmpresaDashboard(lista) {
    if (!el.dashboardEmpresaFiltro) return lista;
    const v = el.dashboardEmpresaFiltro.value || 'todas';
    if (v === 'todas') return lista;
    return lista.filter((e) => validarIdEmpresa(e.empresa) === v);
  }

  function getNumeroSemanaSimples(d) {
    const onejan = new Date(d.getFullYear(), 0, 1);
    const dias = Math.floor((d - onejan) / 86400000);
    return Math.min(53, Math.max(1, Math.ceil((dias + onejan.getDay() + 1) / 7)));
  }

  function chaveAgregacaoEvolucao(dataIso, escala) {
    const d = new Date(dataIso);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = d.getMonth();
    if (escala === 'anual') return String(y);
    if (escala === 'semestral') return `${y}-S${m < 6 ? 1 : 2}`;
    if (escala === 'trimestral') {
      const q = Math.floor(m / 3) + 1;
      return `${y}-Q${q}`;
    }
    if (escala === 'mensal') return `${y}-${String(m + 1).padStart(2, '0')}`;
    if (escala === 'semanal') {
      const w = getNumeroSemanaSimples(d);
      return `${y}-W${String(w).padStart(2, '0')}`;
    }
    return `${y}-${String(m + 1).padStart(2, '0')}`;
  }

  function compararChavesEvolucao(a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
  }

  function desenharGraficoDashboardCanvas(listaFiltrada) {
    const canvas = el.dashboardChartCanvas;
    if (!canvas || !el.dashboardGraficoEscala || !el.dashboardChartVazio) return;
    const escala = el.dashboardGraficoEscala.value || 'mensal';
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const pad = { l: 48, r: 16, t: 24, b: 40 };
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    const mapOrc = {};
    const mapVend = {};
    listaFiltrada.forEach((e) => {
      const val = e.resumo && Number.isFinite(Number(e.resumo.total)) ? Number(e.resumo.total) : 0;
      if (e.criadoEm) {
        const k = chaveAgregacaoEvolucao(e.criadoEm, escala);
        if (k) mapOrc[k] = (mapOrc[k] || 0) + val;
      }
      const m = e.milestones || {};
      const vendDate = m.aprovadoEm || null;
      if (vendDate && statusContaComoVendido(e.status)) {
        const k2 = chaveAgregacaoEvolucao(vendDate, escala);
        if (k2) mapVend[k2] = (mapVend[k2] || 0) + val;
      }
    });

    const keys = [...new Set([...Object.keys(mapOrc), ...Object.keys(mapVend)])].sort(compararChavesEvolucao);
    if (keys.length === 0) {
      el.dashboardChartVazio.classList.remove('hidden');
      return;
    }
    el.dashboardChartVazio.classList.add('hidden');

    let maxV = 0;
    keys.forEach((k) => {
      maxV = Math.max(maxV, mapOrc[k] || 0, mapVend[k] || 0);
    });
    if (maxV <= 0) maxV = 1;

    const innerW = W - pad.l - pad.r;
    const innerH = H - pad.t - pad.b;
    const n = keys.length;
    const stepX = n > 0 ? innerW / Math.max(n - 1, 1) : innerW;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + (innerH * g) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.l, gy);
      ctx.lineTo(W - pad.r, gy);
      ctx.stroke();
    }

    function yVal(v) {
      return pad.t + innerH * (1 - v / maxV);
    }

    function desenharLinha(mapa, cor) {
      ctx.beginPath();
      ctx.strokeStyle = cor;
      ctx.lineWidth = 2.5;
      keys.forEach((k, i) => {
        const v = mapa[k] || 0;
        const x = pad.l + i * stepX;
        const y = yVal(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      keys.forEach((k, i) => {
        const v = mapa[k] || 0;
        const x = pad.l + i * stepX;
        const y = yVal(v);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    desenharLinha(mapOrc, '#64748b');
    desenharLinha(mapVend, '#059669');

    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui,sans-serif';
    keys.forEach((k, i) => {
      const x = pad.l + i * stepX;
      ctx.save();
      ctx.translate(x, H - pad.b + 8);
      ctx.rotate(-0.35);
      ctx.fillText(k, 0, 0);
      ctx.restore();
    });

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 11px system-ui,sans-serif';
    ctx.fillText('R$', 4, pad.t + 12);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui,sans-serif';
    ctx.fillText('Orçado', pad.l, 16);
    ctx.fillStyle = '#059669';
    ctx.fillText('Vendido (aprovado)', pad.l + 70, 16);
  }

  function renderizarDashboardMetricas() {
    if (!el.dashboardCardsGrid) return;
    const listaFull = lerHistoricoOrcamentos();
    let lista = filtrarHistoricoPeriodoDashboard(listaFull);
    lista = filtrarHistoricoEmpresaDashboard(lista);

    let totalOrcado = 0;
    let totalVendido = 0;
    let nConvertidos = 0;
    const origemCount = { 'site-organico': 0, indicacao: 0, 'antigo-recorrente': 0, anuncios: 0 };

    lista.forEach((e) => {
      const t = e.resumo && Number.isFinite(Number(e.resumo.total)) ? Number(e.resumo.total) : 0;
      totalOrcado += t;
      if (statusContaComoVendido(e.status)) {
        totalVendido += t;
        nConvertidos += 1;
      }
      const og = e.origemCliente && ORIGEM_CLIENTE_LABELS[e.origemCliente] ? e.origemCliente : 'site-organico';
      origemCount[og] = (origemCount[og] || 0) + 1;
    });

    const n = lista.length;
    const taxaConv = n > 0 ? (nConvertidos / n) * 100 : 0;

    el.dashboardCardsGrid.innerHTML = `
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total orçado</p>
        <p class="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">${formatarMoeda(totalOrcado)}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-emerald-100">
        <p class="text-xs font-semibold uppercase tracking-wide text-emerald-800">Total vendido</p>
        <p class="mt-1 font-mono text-2xl font-bold tabular-nums text-emerald-900">${formatarMoeda(totalVendido)}</p>
        <p class="mt-1 text-[11px] text-emerald-700">Aprovado/Pago ou estágio seguinte</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-indigo-100">
        <p class="text-xs font-semibold uppercase tracking-wide text-indigo-800">Taxa de conversão</p>
        <p class="mt-1 font-mono text-2xl font-bold tabular-nums text-indigo-950">${taxaConv.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</p>
        <p class="mt-1 text-[11px] text-indigo-700">${nConvertidos} de ${n} pedido(s)</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Pedidos no período</p>
        <p class="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">${n}</p>
      </div>
    `;

    const mapaRank = {};
    lista.forEach((e) => {
      if (!statusContaComoVendido(e.status)) return;
      const nome = ((e.cliente && e.cliente.nome) || 'Sem nome').trim();
      const t = e.resumo && Number.isFinite(Number(e.resumo.total)) ? Number(e.resumo.total) : 0;
      mapaRank[nome] = (mapaRank[nome] || 0) + t;
    });
    const top3 = Object.entries(mapaRank)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    if (el.dashboardRankingLista) {
      if (top3.length === 0) {
        el.dashboardRankingLista.innerHTML = '<li class="text-slate-500">Sem vendas no período filtrado.</li>';
      } else {
        el.dashboardRankingLista.innerHTML = top3
          .map(
            ([nome, val], i) =>
              `<li><span class="font-semibold text-slate-900">${i + 1}. ${escapeHtml(nome)}</span> — <span class="tabular-nums text-emerald-800">${formatarMoeda(val)}</span></li>`
          )
          .join('');
      }
    }

    if (el.dashboardOrigemResumo) {
      if (n === 0) {
        el.dashboardOrigemResumo.textContent = '—';
      } else {
        const partes = Object.keys(ORIGEM_CLIENTE_LABELS).map((k) => {
          const c = origemCount[k] || 0;
          const pct = ((c / n) * 100).toFixed(0);
          return `${pct}% ${ORIGEM_CLIENTE_LABELS[k]}`;
        });
        el.dashboardOrigemResumo.textContent = partes.join(' · ');
      }
    }

    if (el.dashboardTemposMedios) {
      const difsEnvioAprov = [];
      const difsAprovPronto = [];
      const difsProntoEnt = [];
      lista.forEach((e) => {
        const m = e.milestones || {};
        if (m.orcamentoEnviadoEm && m.aprovadoEm) {
          difsEnvioAprov.push(new Date(m.aprovadoEm) - new Date(m.orcamentoEnviadoEm));
        }
        if (m.aprovadoEm && m.prontoEntregaEm) {
          difsAprovPronto.push(new Date(m.prontoEntregaEm) - new Date(m.aprovadoEm));
        }
        if (m.prontoEntregaEm && m.entregueEm) {
          difsProntoEnt.push(new Date(m.entregueEm) - new Date(m.prontoEntregaEm));
        }
      });
      const media = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN);
      el.dashboardTemposMedios.innerHTML = `
        <li><span class="font-medium text-slate-800">Orçamento enviado → Aprovado/Pago:</span> ${formatarDuracaoMedia(media(difsEnvioAprov))} <span class="text-slate-400">(${difsEnvioAprov.length} casos)</span></li>
        <li><span class="font-medium text-slate-800">Aprovado/Pago → Pronto para entrega:</span> ${formatarDuracaoMedia(media(difsAprovPronto))} <span class="text-slate-400">(${difsAprovPronto.length} casos)</span></li>
        <li><span class="font-medium text-slate-800">Pronto para entrega → Entregue:</span> ${formatarDuracaoMedia(media(difsProntoEnt))} <span class="text-slate-400">(${difsProntoEnt.length} casos)</span></li>
      `;
    }

    desenharGraficoDashboardCanvas(lista);
  }

  function sincronizarVisibilidadePeriodoDashboard() {
    if (!el.dashboardPeriodoTipo || !el.dashboardWrapMes || !el.dashboardWrapAno) return;
    const t = el.dashboardPeriodoTipo.value;
    el.dashboardWrapMes.classList.toggle('hidden', t !== 'mes');
    el.dashboardWrapAno.classList.toggle('hidden', t !== 'ano');
  }

  function inicializarDashboardControles() {
    if (el.dashboardMesRef && !el.dashboardMesRef.value) {
      const d = new Date();
      el.dashboardMesRef.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (el.dashboardAnoRef && el.dashboardAnoRef.options.length === 0) {
      const y0 = new Date().getFullYear();
      for (let y = y0 - 6; y <= y0 + 2; y++) {
        const opt = document.createElement('option');
        opt.value = String(y);
        opt.textContent = String(y);
        if (y === y0) opt.selected = true;
        el.dashboardAnoRef.appendChild(opt);
      }
    }
    sincronizarVisibilidadePeriodoDashboard();
  }

  function aoMudarStatusPedidoHistorico(id, novoStatus, selectEl) {
    const lista = lerHistoricoOrcamentos();
    const entry = lista.find((x) => x.id === id);
    if (!entry) return;
    const statusAnterior = entry.status;

    if (
      novoStatus === STATUS_PEDIDO.APROVADO_PAGO &&
      statusAnterior !== STATUS_PEDIDO.APROVADO_PAGO
    ) {
      const defDt = adicionarDiasUteis(new Date(), 5);
      const defStr = dataParaISO(defDt);
      const res = window.prompt(
        'Data prometida de produção (AAAA-MM-DD). Padrão: hoje + 5 dias úteis.',
        defStr
      );
      if (res === null) {
        if (selectEl) selectEl.value = statusAnterior;
        return;
      }
      let ds = String(res).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
        ds = defStr;
      }
      entry.dataPrometidaProducao = ds;
    }

    aplicarMilestonesAoStatus(entry, novoStatus);
    gravarHistoricoOrcamentos(lista);
    renderizarHistorico();
  }

  function marcarFollowUpContatoFeito(id) {
    const lista = lerHistoricoOrcamentos();
    const entry = lista.find((x) => x.id === id);
    if (!entry) return;
    entry.followUpDismissed = true;
    gravarHistoricoOrcamentos(lista);
    renderizarHistorico();
  }

  function classeBordaLinhaHistorico(statusId) {
    const map = {
      [STATUS_PEDIDO.ORCAMENTO_ENVIADO]: 'border-l-4 border-amber-400',
      [STATUS_PEDIDO.APROVADO_PAGO]: 'border-l-4 border-emerald-500',
      [STATUS_PEDIDO.EM_PRODUCAO]: 'border-l-4 border-orange-400',
      [STATUS_PEDIDO.PRONTO_ENTREGA]: 'border-l-4 border-sky-500',
      [STATUS_PEDIDO.ENTREGUE]: 'border-l-4 border-violet-500',
    };
    return map[statusId] || 'border-l-4 border-slate-200';
  }

  function renderizarHistorico() {
    if (!el.historicoTbody || !el.historicoVazio) return;
    const todos = lerHistoricoOrcamentos();
    const q = (el.historicoBusca && el.historicoBusca.value.trim().toLowerCase()) || '';
    const filtrados = q
      ? todos.filter((e) => {
          const nome = ((e.cliente && e.cliente.nome) || '').toLowerCase();
          const ident = `${e.identificador || ''} ${e.identificadorBase || ''}`.toLowerCase();
          const st = obterMetaStatusPedido(e.status).label.toLowerCase();
          const origemTxt = textoOrigemCliente(e.origemCliente).toLowerCase();
          const empTxt = obterConfigEmpresa(e.empresa).nomeCurto.toLowerCase();
          return nome.includes(q) || ident.includes(q) || st.includes(q) || origemTxt.includes(q) || empTxt.includes(q);
        })
      : todos;

    if (todos.length === 0) {
      el.historicoVazio.classList.remove('hidden');
      el.historicoTbody.innerHTML = '';
      renderizarDashboardMetricas();
      renderizarPainelPendencias();
      return;
    }

    el.historicoVazio.classList.add('hidden');

    if (filtrados.length === 0) {
      el.historicoTbody.innerHTML = `
        <tr>
          <td colspan="8" class="px-4 py-8 text-center text-slate-500">Nenhum orçamento encontrado para &quot;${escapeHtml(q)}&quot;.</td>
        </tr>`;
      renderizarDashboardMetricas();
      renderizarPainelPendencias();
      return;
    }

    el.historicoTbody.innerHTML = filtrados
      .map((e) => {
        const total = e.resumo && Number.isFinite(Number(e.resumo.total)) ? Number(e.resumo.total) : 0;
        const nome = escapeHtml((e.cliente && e.cliente.nome) || '—');
        const ident = escapeHtml(e.identificador || '—');
        const quandoCel = formatarDataHoraHistoricoCelulaHtml(e.criadoEm);
        const idAttr = escapeHtml(e.id);
        const stId = e.status || STATUS_PEDIDO.ORCAMENTO_ENVIADO;
        const meta = obterMetaStatusPedido(stId);
        const opts = STATUS_PEDIDO_META.map(
          (s) =>
            `<option value="${escapeHtml(s.id)}"${s.id === stId ? ' selected' : ''}>${escapeHtml(s.label)}</option>`
        ).join('');
        const borda = classeBordaLinhaHistorico(stId);
        const atrasado = pedidoEstaAtrasado(e);
        const trClass = `${borda} ${atrasado ? 'pedido-atrasado-historico' : ''} hover:bg-slate-50/80`;
        const prev = e.dataPrometidaProducao
          ? escapeHtml(formatarDataBR(parseDataISO(e.dataPrometidaProducao)))
          : '—';
        const showFollow = precisaFollowUpOrcamento(e);
        const iconeAtraso = atrasado
          ? '<span class="icone-atraso-pisca ml-1 inline-block" title="Fora do prazo prometido">⚠️</span>'
          : '';
        const cfgEmp = obterConfigEmpresa(e.empresa);
        const badgeEmp =
          e.empresa === EMPRESA_CARTPEL
            ? 'bg-violet-100 text-violet-900 ring-1 ring-violet-200'
            : 'bg-sky-100 text-sky-900 ring-1 ring-sky-200';
        return `
        <tr class="${trClass}">
          <td class="max-w-[18rem] px-4 py-3">
            <p class="font-medium leading-snug text-slate-800">${ident}</p>
            <span class="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.badgeClass}">${escapeHtml(meta.label)}</span>
            ${showFollow ? `<span class="mt-1 mr-1 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800 ring-1 ring-rose-200">Relembre o cliente<button type="button" class="rounded px-1 text-[10px] font-bold text-rose-600 hover:bg-rose-200" data-historico-dismiss-follow="${idAttr}" title="Já entrei em contato">✕</button></span>` : ''}
          </td>
          <td class="px-4 py-3 align-middle text-center">
            <span class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeEmp}">${escapeHtml(cfgEmp.nomeCurto)}</span>
          </td>
          <td class="px-4 py-3 text-slate-700">${nome}</td>
          <td class="px-4 py-3 align-middle text-slate-600">${quandoCel}</td>
          <td class="whitespace-nowrap px-4 py-3 text-slate-700">${prev}</td>
          <td class="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">${formatarMoeda(total)}</td>
          <td class="min-w-[12rem] px-4 py-3 print:hidden">
            <div class="flex flex-wrap items-center gap-1">
              <select data-historico-status="${idAttr}" class="min-w-[10rem] flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500">${opts}</select>
              ${iconeAtraso}
            </div>
          </td>
          <td class="min-w-[13rem] px-4 py-3 text-right print:hidden">
            <div class="flex flex-wrap items-center justify-end gap-1.5">
              <button type="button" class="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-100" data-historico-carregar="${idAttr}">Carregar</button>
              <button type="button" class="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-900 transition hover:bg-violet-100" data-historico-duplicar="${idAttr}">Duplicar</button>
              <button type="button" class="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100" data-historico-excluir="${idAttr}">Excluir</button>
            </div>
          </td>
        </tr>`;
      })
      .join('');

    renderizarDashboardMetricas();
    renderizarPainelPendencias();
  }

  function salvarOrcamentoNoHistorico() {
    if (itensOrcamento.length === 0) {
      window.alert('Adicione pelo menos um item ao orçamento antes de salvar no histórico.');
      return;
    }

    guardarExtras();

    const num = lerProximoNumeroOrcamento();
    const nomeBase = (el.clienteNome && el.clienteNome.value.trim()) || 'Sem nome';
    const empresaId = obterEmpresaSelecionada();
    const identificadorBase = montarIdentificadorBasePedido(empresaId, nomeBase, num);
    const origemVal = el.clienteOrigem && el.clienteOrigem.value ? el.clienteOrigem.value : 'site-organico';
    const identificador = montarIdentificadorComStatus(identificadorBase, STATUS_PEDIDO.ORCAMENTO_ENVIADO);
    const criadoIso = new Date().toISOString();

    const sub = calcularSubtotal();
    const descontoPct = normalizarPercentualDesconto(lerNumeroInput(el.campoDesconto, 0));
    const valDesc = calcularValorDescontoEmReais(sub, descontoPct);
    const subLiq = calcularSubtotalAposDesconto(sub, descontoPct);
    const { frete, faca, cliche } = obterFreteFacaCliche();
    const total = calcularTotalGeralOrcamento(sub, descontoPct, frete, faca, cliche);

    const entry = {
      id: novoId(),
      identificador,
      identificadorBase,
      empresa: empresaId,
      numeroSequencial: num,
      criadoEm: criadoIso,
      status: STATUS_PEDIDO.ORCAMENTO_ENVIADO,
      origemCliente: origemVal,
      milestones: {
        orcamentoEnviadoEm: criadoIso,
      },
      cliente: {
        nome: el.clienteNome ? el.clienteNome.value.trim() : '',
        whatsapp: el.clienteWhatsapp ? el.clienteWhatsapp.value.trim() : '',
        email: el.clienteEmail ? el.clienteEmail.value.trim() : '',
        cnpj: el.clienteCnpj ? el.clienteCnpj.value.trim() : '',
      },
      itens: JSON.parse(JSON.stringify(itensOrcamento)),
      pedido: {
        tipoEntrega: el.pedidoTipoEntrega ? el.pedidoTipoEntrega.value : '',
        dataOrcamento: el.pedidoDataOrcamento ? el.pedidoDataOrcamento.value : '',
        empresa: empresaId,
      },
      fechamento: {
        frete,
        descontoPct,
        custoFaca: faca,
        custoCliche: cliche,
      },
      resumo: {
        subtotal: sub,
        valorDesconto: valDesc,
        subtotalLiquido: subLiq,
        frete,
        faca,
        cliche,
        total,
      },
    };

    const lista = lerHistoricoOrcamentos();
    lista.unshift(entry);
    gravarHistoricoOrcamentos(lista);
    gravarProximoNumeroOrcamento(num + 1);
    registrarClienteCRMDeEntry(entry);
    renderizarHistorico();
    mostrarFeedbackHistorico(`Orçamento salvo: ${identificador}`);
  }

  function carregarOrcamentoDoHistorico(id, opts = {}) {
    const duplicar = opts.modo === 'duplicar';
    const lista = lerHistoricoOrcamentos();
    const entry = lista.find((x) => x.id === id);
    if (!entry) {
      window.alert('Orçamento não encontrado no histórico.');
      return;
    }
    const msg = duplicar
      ? 'Duplicar este pedido na calculadora? Os dados atuais serão substituídos. A data do orçamento será hoje e a validade recalculada em 10 dias. Ao salvar no histórico, será gerado um novo número (#sequência).'
      : 'Carregar este orçamento? Os dados atuais da tela (cliente, itens e valores de fechamento) serão substituídos.';
    if (!window.confirm(msg)) {
      return;
    }

    itensOrcamento = JSON.parse(JSON.stringify(entry.itens));
    guardarItensNoStorage();

    if (el.clienteNome) el.clienteNome.value = entry.cliente ? entry.cliente.nome || '' : '';
    if (el.clienteWhatsapp) el.clienteWhatsapp.value = entry.cliente ? entry.cliente.whatsapp || '' : '';
    if (el.clienteEmail) el.clienteEmail.value = entry.cliente ? entry.cliente.email || '' : '';
    if (el.clienteCnpj) el.clienteCnpj.value = entry.cliente ? entry.cliente.cnpj || '' : '';
    if (el.clienteOrigem) {
      el.clienteOrigem.value = entry.origemCliente && ORIGEM_CLIENTE_LABELS[entry.origemCliente]
        ? entry.origemCliente
        : 'site-organico';
    }

    if (el.pedidoTipoEntrega && entry.pedido && entry.pedido.tipoEntrega) {
      el.pedidoTipoEntrega.value = entry.pedido.tipoEntrega;
    }
    if (el.pedidoEmpresa) {
      const empCarregar = validarIdEmpresa(entry.empresa || (entry.pedido && entry.pedido.empresa));
      el.pedidoEmpresa.value = empCarregar;
    }
    atualizarSecaoPagamentoEmpresaNaTela();
    if (el.pedidoDataOrcamento) {
      if (duplicar) {
        el.pedidoDataOrcamento.value = dataHojeISO();
      } else if (entry.pedido && entry.pedido.dataOrcamento) {
        el.pedidoDataOrcamento.value = entry.pedido.dataOrcamento;
      } else if (!el.pedidoDataOrcamento.value) {
        el.pedidoDataOrcamento.value = dataHojeISO();
      }
    }

    const f = entry.fechamento || {};
    el.campoFrete.value = String(f.frete != null ? f.frete : 0);
    el.campoDesconto.value = String(f.descontoPct != null ? f.descontoPct : 0);
    if (el.campoCustoFaca) el.campoCustoFaca.value = String(f.custoFaca != null ? f.custoFaca : 0);
    if (el.campoCustoCliche) el.campoCustoCliche.value = String(f.custoCliche != null ? f.custoCliche : 0);

    guardarExtras();
    renderizarTabelaItens();
    atualizarPainelResumo();
    if (duplicar) {
      atualizarTextoValidadeOrcamento(DIAS_VALIDADE_DUPLICACAO);
    } else {
      atualizarTextoValidadeOrcamento(DIAS_VALIDADE_PADRAO);
    }
    limparFormularioSimulacao();
    limparAreaResultados();
  }

  function duplicarPedidoDoHistorico(id) {
    carregarOrcamentoDoHistorico(id, { modo: 'duplicar' });
  }

  function excluirOrcamentoDoHistorico(id) {
    if (!window.confirm('Excluir este orçamento do histórico? Esta ação não pode ser desfeita.')) {
      return;
    }
    const lista = lerHistoricoOrcamentos().filter((x) => x.id !== id);
    gravarHistoricoOrcamentos(lista);
    renderizarHistorico();
  }

  function calcularSubtotal() {
    return itensOrcamento.reduce((acc, item) => acc + Number(item.precoTotal), 0);
  }

  function obterFreteFacaCliche() {
    const frete = Math.max(0, lerNumeroInput(el.campoFrete, 0));
    const faca = el.campoCustoFaca ? Math.max(0, lerNumeroInput(el.campoCustoFaca, 0)) : 0;
    const cliche = el.campoCustoCliche ? Math.max(0, lerNumeroInput(el.campoCustoCliche, 0)) : 0;
    return { frete, faca, cliche };
  }

  function calcularTotalGeral() {
    const sub = calcularSubtotal();
    const descontoPct = normalizarPercentualDesconto(lerNumeroInput(el.campoDesconto, 0));
    const { frete, faca, cliche } = obterFreteFacaCliche();
    return calcularTotalGeralOrcamento(sub, descontoPct, frete, faca, cliche);
  }

  function atualizarPainelResumo() {
    const sub = calcularSubtotal();
    const descontoPct = normalizarPercentualDesconto(lerNumeroInput(el.campoDesconto, 0));
    const valDesc = calcularValorDescontoEmReais(sub, descontoPct);
    const subLiq = calcularSubtotalAposDesconto(sub, descontoPct);
    const { frete, faca, cliche } = obterFreteFacaCliche();
    const total = calcularTotalGeralOrcamento(sub, descontoPct, frete, faca, cliche);

    if (el.displaySubtotal) el.displaySubtotal.textContent = formatarMoeda(sub);
    if (el.displayValorDesconto) el.displayValorDesconto.textContent = formatarMoeda(valDesc);
    if (el.displaySubtotalLiquido) el.displaySubtotalLiquido.textContent = formatarMoeda(subLiq);
    if (el.displayTotalGeral) el.displayTotalGeral.textContent = formatarMoeda(total);
  }

  function montarLinhasResumoFinanceiroPdf(sub, descontoPct, valDesc, subLiq, frete, faca, cliche, total) {
    const linhas = [];
    linhas.push(
      `<tr><td class="py-0.5 pr-2 font-medium">Subtotal (itens)</td><td class="py-0.5 text-right font-semibold">${formatarMoeda(sub)}</td></tr>`
    );

    if (descontoPct > 0) {
      linhas.push(
        `<tr><td class="py-0.5 pr-2">Desconto (${descontoPct.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%)</td><td class="py-0.5 text-right">${formatarMoeda(valDesc)}</td></tr>`
      );
      linhas.push(
        `<tr><td class="py-0.5 pr-2 font-medium">Subtotal após desconto</td><td class="py-0.5 text-right font-semibold">${formatarMoeda(subLiq)}</td></tr>`
      );
    }

    if (frete > 0) {
      linhas.push(
        `<tr><td class="py-0.5 pr-2">Frete</td><td class="py-0.5 text-right">${formatarMoeda(frete)}</td></tr>`
      );
    }
    if (faca > 0) {
      linhas.push(
        `<tr><td class="py-0.5 pr-2">Custo de faca</td><td class="py-0.5 text-right">${formatarMoeda(faca)}</td></tr>`
      );
    }
    if (cliche > 0) {
      linhas.push(
        `<tr><td class="py-0.5 pr-2">Custo de clichê</td><td class="py-0.5 text-right">${formatarMoeda(cliche)}</td></tr>`
      );
    }

    linhas.push(
      `<tr><td class="py-0.5 pr-2 pt-1 text-[11pt] font-bold">Total geral</td><td class="py-0.5 pt-1 text-right text-[11pt] font-bold">${formatarMoeda(total)}</td></tr>`
    );

    return linhas.join('');
  }

  function obterTextoTipoEntregaSelecionado() {
    if (!el.pedidoTipoEntrega) return '—';
    const opt = el.pedidoTipoEntrega.options[el.pedidoTipoEntrega.selectedIndex];
    return opt ? opt.textContent.trim() : '—';
  }

  function formatarDataOrcamentoExibicao() {
    if (!el.pedidoDataOrcamento || !el.pedidoDataOrcamento.value) return '—';
    const dt = parseDataISO(el.pedidoDataOrcamento.value);
    return dt ? formatarDataBR(dt) : '—';
  }

  /**
   * Molde a partir do item salvo ou recalculado (mesmas fórmulas que avaliarChapa em calculos.js).
   */
  function obterMoldeLCmm(item) {
    let l = Number(item.moldeL);
    let c = Number(item.moldeC);
    if (Number.isFinite(l) && Number.isFinite(c) && l > 0 && c > 0) {
      return { moldeL: l, moldeC: c };
    }
    const comp = Number(item.comprimento);
    const larg = Number(item.largura);
    const alt = Number(item.altura);
    if (Number.isFinite(comp) && Number.isFinite(larg) && Number.isFinite(alt)) {
      return {
        moldeL: larg + alt + 11,
        moldeC: (comp + larg) * 2 + 63,
      };
    }
    return null;
  }

  function formatarMoldeOp(item) {
    const m = obterMoldeLCmm(item);
    if (!m) return '—';
    return `${Math.round(m.moldeL)} × ${Math.round(m.moldeC)} mm`;
  }

  function formatarMedidasCaixaOp(item) {
    if (item.dimensoesLabel) return String(item.dimensoesLabel).trim();
    const comp = Number(item.comprimento);
    const larg = Number(item.largura);
    const alt = Number(item.altura);
    if (Number.isFinite(comp) && Number.isFinite(larg) && Number.isFinite(alt)) {
      return `${Math.round(comp)} × ${Math.round(larg)} × ${Math.round(alt)}`;
    }
    return '—';
  }

  /**
   * Lê largura/comprimento da chapa a partir de chapaEscolhida ou do rótulo (ex.: "1250 × 1070 mm").
   */
  function parseDimensoesChapaItem(item) {
    const ce = item.chapaEscolhida;
    if (ce != null && ce !== '') {
      if (typeof ce === 'string') {
        const m = ce.trim().match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)$/i);
        if (m) {
          return {
            larguraChapa: parseFloat(m[1].replace(',', '.')),
            comprimentoChapa: parseFloat(m[2].replace(',', '.')),
          };
        }
      }
    }
    const lab = item.chapaLabel;
    if (lab && typeof lab === 'string') {
      const m = lab.match(/(\d+(?:[.,]\d+)?)\s*[×x]\s*(\d+(?:[.,]\d+)?)/);
      if (m) {
        return {
          larguraChapa: parseFloat(m[1].replace(',', '.')),
          comprimentoChapa: parseFloat(m[2].replace(',', '.')),
        };
      }
    }
    return null;
  }

  function obterCaixasPorChapaNumerico(item) {
    let cpp = Number(item.caixasPorChapa);
    if (Number.isFinite(cpp) && cpp > 0) return cpp;
    const dims = parseDimensoesChapaItem(item);
    const comp = Number(item.comprimento);
    const larg = Number(item.largura);
    const alt = Number(item.altura);
    const mat = item.materialId;
    const idx = item.indiceChapa;
    const qtd = Number(item.quantidade);
    if (
      !dims ||
      !Number.isFinite(comp) ||
      !Number.isFinite(larg) ||
      !Number.isFinite(alt) ||
      mat == null ||
      mat === '' ||
      idx == null ||
      !Number.isFinite(qtd) ||
      qtd <= 0
    ) {
      return NaN;
    }
    if (typeof avaliarChapa !== 'function') return NaN;
    const op = avaliarChapa(
      comp,
      larg,
      alt,
      mat,
      qtd,
      dims.larguraChapa,
      dims.comprimentoChapa,
      Number(idx)
    );
    return op ? op.maximoCaixas : NaN;
  }

  function formatarChapaOp(item) {
    const ce = item.chapaEscolhida;
    if (ce != null && ce !== '') {
      if (Array.isArray(ce)) {
        if (ce.length === 2 && typeof ce[0] === 'number' && typeof ce[1] === 'number') {
          return `${Math.round(ce[0])} × ${Math.round(ce[1])} mm`;
        }
        return ce
          .map((row) => {
            if (Array.isArray(row) && row.length >= 2) {
              return `${Math.round(row[0])} × ${Math.round(row[1])}`;
            }
            return String(row);
          })
          .join(', ');
      }
      return String(ce);
    }
    if (item.chapaLabel) return String(item.chapaLabel).trim();
    return '—';
  }

  function chapasASepararOp(item) {
    const q = Number(item.quantidade);
    const cpp = obterCaixasPorChapaNumerico(item);
    if (!Number.isFinite(q) || q <= 0) return '—';
    const divisor = Number.isFinite(cpp) && cpp > 0 ? cpp : 1;
    return String(Math.ceil(q / divisor));
  }

  function textoCaixasPorChapaOp(item) {
    const cpp = obterCaixasPorChapaNumerico(item);
    if (Number.isFinite(cpp) && cpp > 0) return String(Math.round(cpp));
    return '—';
  }

  function preencherContainerOP() {
    if (!el.opContainer) return;
    const dataStr = formatarDataBR(new Date());
    const cfgOp = obterConfigEmpresa(obterEmpresaSelecionada());
    const nomeClienteOp = el.clienteNome ? el.clienteNome.value.trim() : '';
    const nomeClienteDisplay = nomeClienteOp || 'Sem nome';
    const proxNum = lerProximoNumeroOrcamento();
    const refOrcamento = montarIdentificadorBasePedido(obterEmpresaSelecionada(), nomeClienteDisplay, proxNum);
    const linhas = itensOrcamento
      .map((item, i) => {
        const numItem = String(i + 1);
        const medidasCaixa = escapeHtml(formatarMedidasCaixaOp(item));
        const material = escapeHtml(item.materialNome || '—');
        const molde = escapeHtml(formatarMoldeOp(item));
        const chapa = escapeHtml(formatarChapaOp(item));
        const cpp = escapeHtml(textoCaixasPorChapaOp(item));
        const nChapas = escapeHtml(chapasASepararOp(item));
        const qtd = escapeHtml(String(item.quantidade ?? '—'));
        return `
        <tr>
          <td class="tabular-nums op-col-item">${numItem}</td>
          <td>${medidasCaixa}</td>
          <td class="tabular-nums">${qtd}</td>
          <td>${material}</td>
          <td>${molde}</td>
          <td>${chapa}</td>
          <td class="tabular-nums">${cpp}</td>
          <td class="tabular-nums">${nChapas}</td>
          <td class="op-ok-cell"><input type="checkbox" title="OK" aria-label="OK item ${i + 1}" /></td>
        </tr>`;
      })
      .join('');

    el.opContainer.innerHTML = `
      <div class="op-doc">
        <h1 class="op-titulo">ORDEM DE PRODUÇÃO — Data: ${escapeHtml(dataStr)}</h1>
        <div class="op-meta-bloco">
          <p><span class="op-meta-rot">Empresa</span>${escapeHtml(cfgOp.nomeCurto)}</p>
          <p><span class="op-meta-rot">Cliente</span>${escapeHtml(nomeClienteDisplay)}</p>
          <p><span class="op-meta-rot">Pedido / orçamento</span>${escapeHtml(refOrcamento)}</p>
        </div>
        <p class="op-resp">Responsável pelo Corte: ________________________________</p>
        <table class="op-tabela">
          <thead>
            <tr>
              <th class="op-col-item">Item</th>
              <th>Medidas da caixa (C × L × A)</th>
              <th>Qtd. de caixas (pedido)</th>
              <th>Material</th>
              <th>Medidas do molde (L × C)</th>
              <th>Chapa a utilizar</th>
              <th>Caixas por chapa</th>
              <th>Chapas a separar</th>
              <th class="op-ok-cell">OK</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
        <div class="op-rodape">
          <p class="op-rodape-linha">
            <span class="op-rodape-label">Finalizado em:</span>
            Data <span class="op-rodape-campo op-rodape-campo-data" aria-label="Preencher data"></span>
            <span class="op-rodape-sep"></span>
            Hora <span class="op-rodape-campo op-rodape-campo-hora" aria-label="Preencher hora HH:MM"></span>
            <span class="op-rodape-hint">(HH:MM)</span>
          </p>
          <p class="op-rodape-linha op-rodape-assinatura">
            <span class="op-rodape-label">Assinatura</span>
            <span class="op-rodape-linha-assinatura" aria-label="Assinatura do operador"></span>
          </p>
        </div>
      </div>
    `;
    el.opContainer.setAttribute('aria-hidden', 'false');
  }

  function imprimirOP() {
    if (!el.opContainer) return;
    if (itensOrcamento.length === 0) {
      window.alert('Adicione pelo menos um item ao orçamento para gerar a ficha de produção.');
      return;
    }
    preencherContainerOP();
    document.body.classList.add('modo-imprimir-op');

    let limpo = false;
    const removerModo = () => {
      if (limpo) return;
      limpo = true;
      document.body.classList.remove('modo-imprimir-op');
      el.opContainer.setAttribute('aria-hidden', 'true');
      window.removeEventListener('afterprint', removerModo);
    };

    window.addEventListener('afterprint', removerModo);
    window.requestAnimationFrame(() => {
      window.print();
      window.setTimeout(removerModo, 1000);
    });
  }

  /** Evita que beforeprint apague o HTML já carregado quando o utilizador imprime após aguardar as imagens. */
  let suprimirReRenderPrintBeforePrint = false;

  function aguardarImagensDoContainer(root) {
    if (!root) return Promise.resolve();
    const imgs = Array.from(root.querySelectorAll('img[src]'));
    if (!imgs.length) return Promise.resolve();
    return Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            const finish = () => resolve();
            const afterDecode = () => {
              if (typeof img.decode === 'function') {
                img.decode().then(finish).catch(finish);
              } else {
                finish();
              }
            };
            if (img.complete && img.naturalWidth > 0) {
              afterDecode();
              return;
            }
            img.addEventListener('load', afterDecode, { once: true });
            img.addEventListener('error', finish, { once: true });
          })
      )
    );
  }

  function preloadLogosEmpresas() {
    try {
      Object.keys(CONFIG_EMPRESAS).forEach((id) => {
        const rel = CONFIG_EMPRESAS[id].logoRelPath;
        if (!rel) return;
        const im = new Image();
        im.src = new URL(rel, window.location.href).href;
      });
    } catch {
      /* noop */
    }
  }

  function renderizarDocumentoImpressao() {
    const root = el.printContainer;
    if (!root) return;

    atualizarTextoValidadeOrcamento();

    const sub = calcularSubtotal();
    const descontoPct = normalizarPercentualDesconto(lerNumeroInput(el.campoDesconto, 0));
    const valDesc = calcularValorDescontoEmReais(sub, descontoPct);
    const subLiq = calcularSubtotalAposDesconto(sub, descontoPct);
    const { frete, faca, cliche } = obterFreteFacaCliche();
    const total = calcularTotalGeralOrcamento(sub, descontoPct, frete, faca, cliche);

    const linhasResumoValores = montarLinhasResumoFinanceiroPdf(
      sub,
      descontoPct,
      valDesc,
      subLiq,
      frete,
      faca,
      cliche,
      total
    );

    const linhasItens =
      itensOrcamento.length === 0
        ? `<tr><td class="border border-slate-300 px-2 py-2 text-center text-slate-500" colspan="6">Nenhum item neste orçamento.</td></tr>`
        : itensOrcamento
            .map((item, index) => {
              const mat = materialRotuloImpressao(item.materialNome);
              return `
            <tr>
              <td class="border border-slate-300 px-1.5 py-1 text-center">${index + 1}</td>
              <td class="border border-slate-300 px-1.5 py-1">${escapeHtml(item.dimensoesLabel)}</td>
              <td class="border border-slate-300 px-1.5 py-1">${escapeHtml(mat)}</td>
              <td class="border border-slate-300 px-1.5 py-1 text-center">${item.quantidade}</td>
              <td class="border border-slate-300 px-1.5 py-1 text-right">${formatarMoeda(item.precoUnitario)}</td>
              <td class="border border-slate-300 px-1.5 py-1 text-right">${formatarMoeda(item.precoTotal)}</td>
            </tr>`;
            })
            .join('');

    const nomeC = el.clienteNome ? el.clienteNome.value.trim() : '';
    const zap = el.clienteWhatsapp ? el.clienteWhatsapp.value.trim() : '';
    const mail = el.clienteEmail ? el.clienteEmail.value.trim() : '';
    const doc = el.clienteCnpj ? el.clienteCnpj.value.trim() : '';

    const validadeTxt = el.pedidoValidadeTexto ? el.pedidoValidadeTexto.textContent.trim() : '—';
    const cfgPdf = obterConfigEmpresa(obterEmpresaSelecionada());
    const contatosHeaderHtml = cfgPdf.contatosLinhas
      .map((linha) => `<p>${escapeHtml(linha)}</p>`)
      .join('');
    const pPag = cfgPdf.pagamento;
    let logoSrcAttr = '';
    if (cfgPdf.logoRelPath) {
      try {
        logoSrcAttr = escapeHtml(new URL(cfgPdf.logoRelPath, window.location.href).href);
      } catch {
        logoSrcAttr = escapeHtml(cfgPdf.logoRelPath);
      }
    }
    const logoAlt = escapeHtml(cfgPdf.nomeCurto);

    root.innerHTML = `
      <div class="mx-auto max-w-[190mm]">
        <header class="mb-3 flex flex-row items-start justify-between gap-4 border-b border-slate-300 pb-3">
          <div class="orcamento-print-logo-wrap">
            <img src="${logoSrcAttr}" alt="${logoAlt}" class="orcamento-print-logo-img" loading="eager" decoding="sync" />
          </div>
          <div class="min-w-0 flex-1 text-right text-[10.5pt] leading-snug text-slate-900">
            <p class="text-[16pt] font-bold leading-tight">${escapeHtml(cfgPdf.nomeCurto)}</p>
            <p class="mt-0.5"><span class="font-semibold">CNPJ:</span> ${escapeHtml(cfgPdf.cnpj)}</p>
            <p class="mt-0.5">Endereço: ${escapeHtml(cfgPdf.endereco)}</p>
            ${contatosHeaderHtml}
          </div>
        </header>

        <section class="mb-3 print-no-break">
          <h2 class="mb-1 text-[11pt] font-bold text-slate-900">Dados do cliente</h2>
          <div class="grid grid-cols-3 gap-x-3 gap-y-1 text-[10pt] text-slate-800">
            <div><span class="font-semibold">Nome / Razão social:</span> ${nomeC ? escapeHtml(nomeC) : '—'}</div>
            <div><span class="font-semibold">Telefone / WhatsApp:</span> ${zap ? escapeHtml(zap) : '—'}</div>
            <div><span class="font-semibold">E-mail:</span> ${mail ? escapeHtml(mail) : '—'}</div>
            <div class="col-span-3"><span class="font-semibold">CNPJ / CPF:</span> ${doc ? escapeHtml(doc) : '—'}</div>
          </div>
        </section>

        <section class="mb-3">
          <h2 class="mb-1 text-[11pt] font-bold text-slate-900">Orçamento</h2>
          <table class="print-doc-table w-full border-collapse text-[9.5pt]">
            <thead>
              <tr class="bg-slate-100 text-left">
                <th class="border border-slate-400 px-1.5 py-1 font-semibold" style="width:8%">Item</th>
                <th class="border border-slate-400 px-1.5 py-1 font-semibold" style="width:22%">Dimensões (mm)</th>
                <th class="border border-slate-400 px-1.5 py-1 font-semibold" style="width:18%">Material</th>
                <th class="border border-slate-400 px-1.5 py-1 font-semibold text-center" style="width:10%">Qtd</th>
                <th class="border border-slate-400 px-1.5 py-1 font-semibold text-right" style="width:20%">Preço unit.</th>
                <th class="border border-slate-400 px-1.5 py-1 font-semibold text-right" style="width:22%">Total</th>
              </tr>
            </thead>
            <tbody>${linhasItens}</tbody>
          </table>
        </section>

        <section class="mb-3 print-no-break">
          <h2 class="mb-1 text-[11pt] font-bold text-slate-900">Valores</h2>
          <table class="w-full max-w-md border-collapse text-[10pt]"><tbody>${linhasResumoValores}</tbody></table>
        </section>

        <section class="mb-3 print-no-break rounded border border-slate-200 bg-slate-50 px-3 py-2 text-[9.5pt] text-slate-800">
          <h2 class="mb-1 text-[11pt] font-bold text-slate-900">Informações do pedido</h2>
          <p><span class="font-semibold">Empresa responsável:</span> ${escapeHtml(cfgPdf.nomeCurto)}</p>
          <p><span class="font-semibold">Tipo de entrega:</span> ${escapeHtml(obterTextoTipoEntregaSelecionado())}</p>
          <p><span class="font-semibold">Data do orçamento:</span> ${escapeHtml(formatarDataOrcamentoExibicao())}</p>
          <p><span class="font-semibold">Validade:</span> ${escapeHtml(validadeTxt)}</p>
          <p class="mt-1 font-medium text-slate-900">Observação: o prazo de entrega é de até 5 dias úteis após a confirmação do pagamento.</p>
        </section>

        <section class="print-no-break rounded border border-slate-200 px-3 py-2 text-[9pt] text-slate-700">
          <h2 class="mb-1 text-[10pt] font-bold text-slate-900">Dados para pagamento</h2>
          <p><span class="font-semibold text-slate-800">Banco:</span> ${escapeHtml(pPag.banco)} <span class="text-slate-400">|</span> <span class="font-semibold">Ag:</span> ${escapeHtml(pPag.agencia)} <span class="text-slate-400">|</span> <span class="font-semibold">CC:</span> ${escapeHtml(pPag.conta)}</p>
          <p><span class="font-semibold text-slate-800">Favorecido:</span> ${escapeHtml(pPag.favorecido)}</p>
          <p><span class="font-semibold text-slate-800">CNPJ:</span> ${escapeHtml(cfgPdf.cnpj)}</p>
          <p><span class="font-semibold text-slate-800">Chave Pix:</span> ${escapeHtml(pPag.pix)}</p>
        </section>
      </div>
    `;
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

  /**
   * Lê inputs do painel para window.dadosMateriais e window.chapasAtivas.
   */
  function sincronizarConfiguracaoDosInputs() {
    if (!window.dadosMateriais) return;
    Object.keys(window.dadosMateriais).forEach((nome) => {
      const slug = slugMaterial(nome);
      const pesoEl = document.getElementById(`cfg-peso-${slug}`);
      const precoEl = document.getElementById(`cfg-preco-${slug}`);
      const pontEl = document.getElementById(`cfg-pont-${slug}`);
      if (pesoEl) {
        const v = parseFloat(String(pesoEl.value).replace(',', '.'));
        if (Number.isFinite(v)) window.dadosMateriais[nome].pesoM2 = v;
      }
      if (precoEl) {
        const v = parseFloat(String(precoEl.value).replace(',', '.'));
        if (Number.isFinite(v)) window.dadosMateriais[nome].precoPorKg = v;
      }
      if (pontEl) {
        const v = parseFloat(String(pontEl.value).replace(',', '.'));
        if (Number.isFinite(v)) window.dadosMateriais[nome].pontuacao = v;
      }
    });

    document.querySelectorAll('input.cfg-chapa-cb[type="checkbox"]').forEach((cb) => {
      const mat = cb.getAttribute('data-material');
      const idx = parseInt(cb.getAttribute('data-indice'), 10);
      if (!mat || !Number.isFinite(idx)) return;
      if (!window.chapasAtivas[mat]) window.chapasAtivas[mat] = [];
      window.chapasAtivas[mat][idx] = cb.checked;
    });
  }

  function montarPainelConfiguracao() {
    if (!el.painelParams || !el.painelChapas) return;
    el.painelParams.innerHTML = '';
    el.painelChapas.innerHTML = '';

    const nomesMats = Object.keys(window.dadosMateriais || {}).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    nomesMats.forEach((nome) => {
      const m = window.dadosMateriais[nome];
      const slug = slugMaterial(nome);
      const card = document.createElement('div');
      card.className = 'rounded-lg border border-slate-700/50 bg-slate-900/50 p-3';
      card.innerHTML = `
        <p class="mb-2 text-sm font-medium text-white">${escapeHtml(nome)}</p>
        <div class="grid gap-2 sm:grid-cols-3">
          <div>
            <label class="mb-0.5 block text-xs text-slate-400" for="cfg-peso-${slug}">Peso (kg/m²)</label>
            <input type="number" step="any" min="0" id="cfg-peso-${slug}" class="w-full rounded border border-slate-600 bg-slate-950/50 px-2 py-1.5 text-sm text-white" value="${m.pesoM2}" />
          </div>
          <div>
            <label class="mb-0.5 block text-xs text-slate-400" for="cfg-preco-${slug}">Preço/kg (R$)</label>
            <input type="number" step="any" min="0" id="cfg-preco-${slug}" class="w-full rounded border border-slate-600 bg-slate-950/50 px-2 py-1.5 text-sm text-white" value="${m.precoPorKg}" />
          </div>
          <div>
            <label class="mb-0.5 block text-xs text-slate-400" for="cfg-pont-${slug}">Pontuação</label>
            <input type="number" step="any" min="0" id="cfg-pont-${slug}" class="w-full rounded border border-slate-600 bg-slate-950/50 px-2 py-1.5 text-sm text-white" value="${m.pontuacao}" />
          </div>
        </div>
      `;
      el.painelParams.appendChild(card);
    });

    nomesMats.forEach((nome) => {
      const chapas = (window.chapasDisponiveis && window.chapasDisponiveis[nome]) || [];
      const ativas = (window.chapasAtivas && window.chapasAtivas[nome]) || [];
      const bloco = document.createElement('div');
      bloco.className = 'cfg-chapas-bloco rounded-lg border border-slate-700/50 bg-slate-900/50 p-3';
      bloco.setAttribute('data-material', nome);

      const head = document.createElement('div');
      head.className = 'mb-2 flex flex-wrap items-center justify-between gap-2';
      head.innerHTML = `<p class="text-sm font-medium text-white">${escapeHtml(nome)}</p>`;
      const acoes = document.createElement('div');
      acoes.className = 'flex flex-wrap gap-2';
      const btnMarcar = document.createElement('button');
      btnMarcar.type = 'button';
      btnMarcar.className =
        'rounded border border-emerald-600/60 bg-emerald-950/40 px-2 py-1 text-xs font-medium text-emerald-200 hover:bg-emerald-900/50';
      btnMarcar.textContent = 'Marcar todas';
      btnMarcar.setAttribute('data-acao', 'marcar-todas');
      const btnDesmarcar = document.createElement('button');
      btnDesmarcar.type = 'button';
      btnDesmarcar.className =
        'rounded border border-slate-600 bg-slate-800/80 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700';
      btnDesmarcar.textContent = 'Desmarcar todas';
      btnDesmarcar.setAttribute('data-acao', 'desmarcar-todas');
      acoes.appendChild(btnMarcar);
      acoes.appendChild(btnDesmarcar);
      head.appendChild(acoes);
      bloco.appendChild(head);

      const lista = document.createElement('div');
      lista.className = 'space-y-1.5';
      chapas.forEach((par, i) => {
        const larg = par[0];
        const comp = par[1];
        const checked = ativas[i] !== false;
        const row = document.createElement('label');
        row.className =
          'flex cursor-pointer items-center gap-2 rounded border border-transparent px-1 py-0.5 text-sm text-slate-200 hover:border-slate-600/60 hover:bg-slate-800/40';
        const id = `cfg-chapa-${slugMaterial(nome)}-${i}`;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className =
          'cfg-chapa-cb h-4 w-4 rounded border-slate-500 text-amber-500 focus:ring-amber-500';
        cb.id = id;
        cb.setAttribute('data-material', nome);
        cb.setAttribute('data-indice', String(i));
        cb.checked = checked;
        const span = document.createElement('span');
        span.className = 'tabular-nums';
        span.textContent = `${formatarNumero(larg, 0)} × ${formatarNumero(comp, 0)} mm`;
        row.appendChild(cb);
        row.appendChild(span);
        lista.appendChild(row);
      });
      bloco.appendChild(lista);
      el.painelChapas.appendChild(bloco);
    });
  }

  function mostrarFeedbackConfigSalva() {
    if (!el.configMsgFeedback) return;
    el.configMsgFeedback.textContent = 'Configurações guardadas neste navegador.';
    el.configMsgFeedback.classList.remove('hidden');
    window.clearTimeout(mostrarFeedbackConfigSalva._t);
    mostrarFeedbackConfigSalva._t = window.setTimeout(() => {
      el.configMsgFeedback.classList.add('hidden');
    }, 3500);
  }

  function preencherMateriais() {
    el.material.innerHTML = '';
    const itens = listarMateriaisParaSelect();
    if (itens.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.disabled = true;
      opt.selected = true;
      opt.textContent = '— sem materiais —';
      el.material.appendChild(opt);
      return;
    }
    itens.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.nome;
      el.material.appendChild(opt);
    });
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
    if (!window.dadosMateriais || Object.keys(window.dadosMateriais).length === 0) {
      return 'Não há materiais configurados.';
    }
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

  function lerPrecoUnitarioDoInputOpcao(inputEl) {
    const raw = String(inputEl.value ?? '')
      .trim()
      .replace(',', '.');
    let v = parseFloat(raw);
    if (!Number.isFinite(v) || v < 0) v = 0;
    return v;
  }

  /**
   * Mantém `opcoesAtual` e o texto "Total" alinhados ao preço unitário editável.
   * @param {{ normalizarInput?: boolean }} opts - se true, reescreve o input com 2 casas (ex.: ao sair do campo).
   */
  function sincronizarPrecoUnitarioLinhaResultado(inputEl, opts = {}) {
    const idx = parseInt(inputEl.getAttribute('data-indice-chapa'), 10);
    const op = opcoesAtual.find((o) => o.indiceChapa === idx);
    if (!op) return;
    const rawStr = String(inputEl.value ?? '').trim();
    const rawNum = parseFloat(rawStr.replace(',', '.'));
    if (Number.isFinite(rawNum) && rawNum < 0) {
      inputEl.value = '0';
    }
    const v = lerPrecoUnitarioDoInputOpcao(inputEl);
    op.precoUnitario = v;
    op.precoTotal = v * op.quantidade;
    if (opts.normalizarInput) {
      inputEl.value = v.toFixed(2);
    }
    const row = inputEl.closest('.opcao-chapa-row');
    const totalEl = row && row.querySelector('.opcao-preco-total');
    if (totalEl) totalEl.textContent = formatarMoeda(op.precoTotal);
  }

  function atualizarResumoSePrecoDaLinhaAtiva(inputEl) {
    const sel = el.resultadosLista.querySelector('input[name="chapa-escolhida"]:checked');
    if (!sel) return;
    const idxSel = parseInt(sel.value, 10);
    const idxInp = parseInt(inputEl.getAttribute('data-indice-chapa'), 10);
    if (idxSel === idxInp) atualizarResumoSelecao(opcoesAtual);
  }

  function renderizarOpcoes(opcoes) {
    opcoesAtual = opcoes;
    el.resultadosVazio.classList.add('hidden');
    el.resultadosLista.classList.remove('hidden');
    el.resultadosLista.innerHTML = '';

    opcoes.forEach((op, rank) => {
      const row = document.createElement('div');
      row.className =
        'opcao-chapa-row flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-400 hover:shadow-md sm:flex-row sm:items-start sm:justify-between';
      const unitStr = Number(op.precoUnitario).toFixed(2);
      const radioId = `chapa-radio-${op.indiceChapa}`;
      const ariaOp = `#${rank + 1} — ${op.dimensoesLabel}, ${op.maximoCaixas} caixa(s) por chapa`;
      row.innerHTML = `
        <div class="opcao-chapa-select flex min-w-0 flex-1 cursor-pointer items-start gap-3 sm:min-w-0">
          <input type="radio" id="${radioId}" name="chapa-escolhida" value="${op.indiceChapa}" aria-label=${JSON.stringify(ariaOp)} class="mt-1 h-4 w-4 shrink-0 text-amber-600 focus:ring-amber-500" ${rank === 0 ? 'checked' : ''} />
          <div class="min-w-0">
            <p class="font-semibold text-slate-800">#${rank + 1} — ${escapeHtml(op.dimensoesLabel)}</p>
            <p class="mt-1 text-sm text-slate-600">
              Cabem <strong>${op.maximoCaixas}</strong> caixa(s) por chapa
              (grade ${op.caixasL} × ${op.caixasC}) · Sobra/caixa: ${formatarNumero(op.sobraPorCaixa, 0)} mm²
            </p>
            <p class="mt-1 text-xs text-slate-500">
              Molde L: ${formatarNumero(op.moldeL, 0)} mm · Molde C: ${formatarNumero(op.moldeC, 0)} mm · Área do molde: ${formatarNumero(op.areaMoldeM2, 6)} m²
            </p>
          </div>
        </div>
        <div class="opcao-chapa-precos relative z-10 flex flex-shrink-0 flex-wrap items-end gap-4 text-sm touch-manipulation sm:text-right">
          <div class="min-w-[8.5rem]">
            <span class="block text-slate-500">Unitário (R$)</span>
            <input
              type="number"
              id="preco-unit-op-${op.indiceChapa}"
              name="preco-unit-op"
              min="0"
              step="0.01"
              inputmode="decimal"
              autocomplete="off"
              value="${unitStr}"
              data-indice-chapa="${op.indiceChapa}"
              class="opcao-preco-unit-input relative z-10 mt-1 min-h-[44px] w-full max-w-[10rem] rounded-md border border-amber-300/90 bg-amber-50/70 px-2 py-1.5 text-right text-base font-semibold tabular-nums text-amber-950 shadow-inner outline-none ring-amber-500/0 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30"
            />
          </div>
          <div>
            <span class="text-slate-500">Total (${op.quantidade} un.)</span>
            <p class="opcao-preco-total mt-1 text-lg font-bold tabular-nums text-slate-800">${formatarMoeda(op.precoTotal)}</p>
          </div>
        </div>
      `;
      el.resultadosLista.appendChild(row);

      const selectBlock = row.querySelector('.opcao-chapa-select');
      const radio = row.querySelector('input[name="chapa-escolhida"]');
      if (selectBlock && radio) {
        selectBlock.addEventListener('click', (e) => {
          if (e.target instanceof HTMLInputElement && e.target.name === 'chapa-escolhida') return;
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
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
    sincronizarConfiguracaoDosInputs();

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
        'Nenhuma chapa ativa deste material comporta o molde, ou todas as chapas úteis estão desmarcadas no painel. Ajuste medidas, material ou o stock.';
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

    const inpUnit = el.resultadosLista.querySelector(
      `input.opcao-preco-unit-input[data-indice-chapa="${op.indiceChapa}"]`
    );
    if (inpUnit) {
      sincronizarPrecoUnitarioLinhaResultado(inpUnit, { normalizarInput: true });
    }

    sincronizarConfiguracaoDosInputs();
    const d = lerFormulario();
    if (validar(d)) return;

    const dimensoesLabel = `${Math.round(d.comp)} × ${Math.round(d.larg)} × ${Math.round(d.alt)}`;
    const chapaEscolhida = `${Math.round(op.larguraChapa)}x${Math.round(op.comprimentoChapa)}`;

    const precoUnitFinal = op.precoUnitario;
    const precoTotalFinal = precoUnitFinal * d.quantidade;

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
      precoUnitario: precoUnitFinal,
      precoTotal: precoTotalFinal,
      moldeL: op.moldeL,
      moldeC: op.moldeC,
      chapaEscolhida,
      caixasPorChapa: op.maximoCaixas,
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

  el.resultadosLista.addEventListener('input', (e) => {
    if (!e.target.matches('input.opcao-preco-unit-input')) return;
    sincronizarPrecoUnitarioLinhaResultado(e.target);
    atualizarResumoSePrecoDaLinhaAtiva(e.target);
  });

  el.resultadosLista.addEventListener('change', (e) => {
    if (!e.target.matches('input.opcao-preco-unit-input')) return;
    sincronizarPrecoUnitarioLinhaResultado(e.target, { normalizarInput: true });
    atualizarResumoSePrecoDaLinhaAtiva(e.target);
  });

  if (el.painelChapas) {
    el.painelChapas.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-acao]');
      if (!btn) return;
      const bloco = btn.closest('.cfg-chapas-bloco');
      if (!bloco) return;
      const mat = bloco.getAttribute('data-material');
      if (!mat) return;
      const acao = btn.getAttribute('data-acao');
      const marcar = acao === 'marcar-todas';
      bloco.querySelectorAll('input.cfg-chapa-cb[type="checkbox"]').forEach((cb) => {
        cb.checked = marcar;
      });
    });
  }

  if (el.btnSalvarConfig) {
    el.btnSalvarConfig.addEventListener('click', () => {
      sincronizarConfiguracaoDosInputs();
      salvarConfiguracaoNoArmazenamento();
      mostrarFeedbackConfigSalva();
    });
  }

  el.campoFrete.addEventListener('input', () => {
    guardarExtras();
    atualizarPainelResumo();
  });
  el.campoDesconto.addEventListener('input', () => {
    guardarExtras();
    atualizarPainelResumo();
  });
  if (el.campoCustoFaca) {
    el.campoCustoFaca.addEventListener('input', () => {
      guardarExtras();
      atualizarPainelResumo();
    });
  }
  if (el.campoCustoCliche) {
    el.campoCustoCliche.addEventListener('input', () => {
      guardarExtras();
      atualizarPainelResumo();
    });
  }
  el.clienteNome.addEventListener('input', guardarExtras);
  el.clienteNome.addEventListener('change', () => {
    preencherClientePorNomeDigitado();
  });
  el.clienteNome.addEventListener('blur', () => {
    preencherClientePorNomeDigitado();
  });
  if (el.clienteWhatsapp) el.clienteWhatsapp.addEventListener('input', guardarExtras);
  if (el.clienteEmail) el.clienteEmail.addEventListener('input', guardarExtras);
  if (el.clienteCnpj) el.clienteCnpj.addEventListener('input', guardarExtras);
  if (el.pedidoTipoEntrega) el.pedidoTipoEntrega.addEventListener('change', guardarExtras);
  if (el.pedidoEmpresa) {
    el.pedidoEmpresa.addEventListener('change', () => {
      guardarExtras();
      atualizarSecaoPagamentoEmpresaNaTela();
    });
  }
  if (el.pedidoDataOrcamento) {
    el.pedidoDataOrcamento.addEventListener('change', () => {
      atualizarTextoValidadeOrcamento(DIAS_VALIDADE_PADRAO);
      guardarExtras();
    });
  }

  if (el.btnLimparOrcamento) {
    el.btnLimparOrcamento.addEventListener('click', () => {
      limparDadosOrcamentoComercial();
    });
  }

  el.btnImprimir.addEventListener('click', async () => {
    renderizarDocumentoImpressao();
    await aguardarImagensDoContainer(el.printContainer);
    suprimirReRenderPrintBeforePrint = true;
    try {
      window.print();
    } finally {
      window.queueMicrotask(() => {
        suprimirReRenderPrintBeforePrint = false;
      });
    }
  });

  window.addEventListener('beforeprint', () => {
    if (document.body.classList.contains('modo-imprimir-op')) return;
    if (suprimirReRenderPrintBeforePrint) return;
    renderizarDocumentoImpressao();
  });

  if (el.btnImprimirOP) {
    el.btnImprimirOP.addEventListener('click', () => {
      imprimirOP();
    });
  }

  if (el.btnSalvarOrcamentoHistorico) {
    el.btnSalvarOrcamentoHistorico.addEventListener('click', () => {
      salvarOrcamentoNoHistorico();
    });
  }

  if (el.historicoBusca) {
    el.historicoBusca.addEventListener('input', () => {
      renderizarHistorico();
    });
  }

  if (el.painelPendencias) {
    el.painelPendencias.addEventListener('click', (e) => {
      const bPend = e.target.closest('[data-pendencia-carregar]');
      if (bPend) {
        e.preventDefault();
        const idP = bPend.getAttribute('data-pendencia-carregar');
        if (idP) carregarOrcamentoDoHistorico(idP);
      }
    });
  }

  if (el.secaoHistorico) {
    el.secaoHistorico.addEventListener('click', (e) => {
      const bDismiss = e.target.closest('[data-historico-dismiss-follow]');
      if (bDismiss) {
        e.preventDefault();
        const id = bDismiss.getAttribute('data-historico-dismiss-follow');
        if (id) marcarFollowUpContatoFeito(id);
        return;
      }
      const bLoad = e.target.closest('[data-historico-carregar]');
      if (bLoad) {
        const id = bLoad.getAttribute('data-historico-carregar');
        if (id) carregarOrcamentoDoHistorico(id);
        return;
      }
      const bDup = e.target.closest('[data-historico-duplicar]');
      if (bDup) {
        const id = bDup.getAttribute('data-historico-duplicar');
        if (id) duplicarPedidoDoHistorico(id);
        return;
      }
      const bDel = e.target.closest('[data-historico-excluir]');
      if (bDel) {
        const id = bDel.getAttribute('data-historico-excluir');
        if (id) excluirOrcamentoDoHistorico(id);
      }
    });
  }

  if (el.historicoTbody) {
    el.historicoTbody.addEventListener('change', (e) => {
      const sel = e.target.closest('select[data-historico-status]');
      if (!sel) return;
      e.stopPropagation();
      const id = sel.getAttribute('data-historico-status');
      const v = sel.value;
      if (id) aoMudarStatusPedidoHistorico(id, v, sel);
    });
  }

  if (el.clienteOrigem) {
    el.clienteOrigem.addEventListener('change', guardarExtras);
  }

  if (el.pendenciasEmpresaFiltro) {
    el.pendenciasEmpresaFiltro.addEventListener('change', () => {
      localStorage.setItem(LS_PENDENCIAS_EMPRESA_FILTRO, el.pendenciasEmpresaFiltro.value);
      pendenciasEmpresaFiltroCarregado = true;
      renderizarPainelPendencias();
    });
  }

  if (el.dashboardPeriodoTipo) {
    el.dashboardPeriodoTipo.addEventListener('change', () => {
      sincronizarVisibilidadePeriodoDashboard();
      renderizarDashboardMetricas();
    });
  }
  if (el.dashboardMesRef) {
    el.dashboardMesRef.addEventListener('change', () => {
      renderizarDashboardMetricas();
    });
  }
  if (el.dashboardAnoRef) {
    el.dashboardAnoRef.addEventListener('change', () => {
      renderizarDashboardMetricas();
    });
  }
  if (el.dashboardGraficoEscala) {
    el.dashboardGraficoEscala.addEventListener('change', () => {
      renderizarDashboardMetricas();
    });
  }
  if (el.dashboardEmpresaFiltro) {
    el.dashboardEmpresaFiltro.addEventListener('change', () => {
      renderizarDashboardMetricas();
    });
  }

  if (el.dashboardMetricasDetails) {
    el.dashboardMetricasDetails.addEventListener('toggle', () => {
      if (el.dashboardMetricasDetails.open) {
        renderizarDashboardMetricas();
      }
    });
  }

  inicializarDashboardControles();
  popularDatalistClientes();

  montarPainelConfiguracao();
  preencherMateriais();
  itensOrcamento = carregarItensDoStorage();
  carregarExtras();
  renderizarTabelaItens();
  renderizarHistorico();
  preloadLogosEmpresas();

  if (estaAutenticado()) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
})();
