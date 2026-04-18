/**
 * Configuração local — materiais, chapas e persistência (localStorage).
 */

const APP_CONFIG = {
  senhaPadrao: 'caixas2026',
};

const LS_CONFIG_MATERIAIS = 'orcamento_config_materiais_v2';
const LS_CONFIG_CHAPAS = 'orcamento_config_chapas_v2';
const LS_CONFIG_CHAPAS_ATIVAS = 'orcamento_config_chapas_ativas_v2';

/** @type {Record<string, { nome: string, pesoM2: number, precoPorKg: number, pontuacao: number }>} */
window.dadosMateriais = window.dadosMateriais || {};

/** @type {Record<string, number[][]>} Largura × Comprimento (mm) por material */
window.chapasDisponiveis = window.chapasDisponiveis || {};

/** @type {Record<string, boolean[]>} Uma entrada por chapa em chapasDisponiveis[material] */
window.chapasAtivas = window.chapasAtivas || {};

function slugMaterial(nome) {
  return String(nome)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '');
}

function obterDadosMateriaisPadrao() {
  return {
    'Duplex onda baixa': {
      nome: 'Duplex onda baixa',
      pesoM2: 0.342,
      precoPorKg: 7.5,
      pontuacao: 1.6,
    },
    'Duplex onda alta': {
      nome: 'Duplex onda alta',
      pesoM2: 0.352,
      precoPorKg: 7.5,
      pontuacao: 1.6,
    },
    Triplex: {
      nome: 'Triplex',
      pesoM2: 0.594,
      precoPorKg: 7.5,
      pontuacao: 1.6,
    },
  };
}

function obterChapasPadrao() {
  return {
    'Duplex onda baixa': [
      [1000, 1000],
      [1250, 1070],
      [1250, 1270],
      [1450, 1770],
    ],
    'Duplex onda alta': [
      [950, 1200],
      [1100, 1100],
      [1100, 1060],
      [1170, 1170],
      [1150, 1300],
      [1250, 1300],
      [1200, 1350],
      [1000, 1450],
      [1200, 1500],
      [820, 1660],
      [960, 1950],
      [1350, 1400],
      [1250, 900],
      [870, 2070],
      [1100, 2150],
      [750, 1870],
      [1450, 1200],
      [1300, 1700],
    ],
    Triplex: [
      [1550, 1770],
      [1300, 1700],
      [1300, 1300],
      [1050, 1180],
    ],
  };
}

function criarChapasAtivasTodas(chapasPorMaterial) {
  /** @type {Record<string, boolean[]>} */
  const out = {};
  Object.keys(chapasPorMaterial).forEach((mat) => {
    const n = chapasPorMaterial[mat].length;
    out[mat] = Array.from({ length: n }, () => true);
  });
  return out;
}

function mesclarChapasAtivasComEstoque(chapasPorMaterial, ativasSalvas) {
  const base = criarChapasAtivasTodas(chapasPorMaterial);
  if (!ativasSalvas || typeof ativasSalvas !== 'object') return base;
  Object.keys(chapasPorMaterial).forEach((mat) => {
    const len = chapasPorMaterial[mat].length;
    const arr = Array.isArray(ativasSalvas[mat]) ? ativasSalvas[mat] : [];
    base[mat] = [];
    for (let i = 0; i < len; i += 1) {
      base[mat][i] = typeof arr[i] === 'boolean' ? arr[i] : true;
    }
  });
  return base;
}

function aplicarPadroesGlobais() {
  window.dadosMateriais = JSON.parse(JSON.stringify(obterDadosMateriaisPadrao()));
  window.chapasDisponiveis = JSON.parse(JSON.stringify(obterChapasPadrao()));
  window.chapasAtivas = criarChapasAtivasTodas(window.chapasDisponiveis);
}

/**
 * Carrega do localStorage ou mantém padrões do código.
 */
function carregarConfiguracaoDoArmazenamento() {
  aplicarPadroesGlobais();
  try {
    const rawM = localStorage.getItem(LS_CONFIG_MATERIAIS);
    if (rawM) {
      const parsed = JSON.parse(rawM);
      if (parsed && typeof parsed === 'object') {
        Object.keys(window.dadosMateriais).forEach((k) => {
          if (!parsed[k]) return;
          const p = parsed[k];
          if (Number.isFinite(Number(p.pesoM2))) window.dadosMateriais[k].pesoM2 = Number(p.pesoM2);
          if (Number.isFinite(Number(p.precoPorKg))) window.dadosMateriais[k].precoPorKg = Number(p.precoPorKg);
          if (Number.isFinite(Number(p.pontuacao))) window.dadosMateriais[k].pontuacao = Number(p.pontuacao);
        });
      }
    }
    const rawC = localStorage.getItem(LS_CONFIG_CHAPAS);
    if (rawC) {
      const parsed = JSON.parse(rawC);
      if (parsed && typeof parsed === 'object') {
        Object.keys(window.chapasDisponiveis).forEach((k) => {
          if (!Array.isArray(parsed[k])) return;
          const atual = window.chapasDisponiveis[k];
          const novo = parsed[k]
            .map((par) => {
              if (!Array.isArray(par) || par.length < 2) return null;
              const la = parseFloat(par[0]);
              const co = parseFloat(par[1]);
              if (!Number.isFinite(la) || !Number.isFinite(co)) return null;
              return [la, co];
            })
            .filter(Boolean);
          if (novo.length > 0) window.chapasDisponiveis[k] = novo;
        });
      }
    }
    const rawA = localStorage.getItem(LS_CONFIG_CHAPAS_ATIVAS);
    const ativasParsed = rawA ? JSON.parse(rawA) : null;
    window.chapasAtivas = mesclarChapasAtivasComEstoque(window.chapasDisponiveis, ativasParsed);
  } catch (e) {
    console.warn('Config: falha ao ler localStorage, a usar padrões.', e);
    aplicarPadroesGlobais();
  }
}

/**
 * Persiste materiais, chapas e flags de chapas ativas.
 */
function salvarConfiguracaoNoArmazenamento() {
  localStorage.setItem(LS_CONFIG_MATERIAIS, JSON.stringify(window.dadosMateriais));
  localStorage.setItem(LS_CONFIG_CHAPAS, JSON.stringify(window.chapasDisponiveis));
  localStorage.setItem(LS_CONFIG_CHAPAS_ATIVAS, JSON.stringify(window.chapasAtivas));
}

function obterMaterial(materialId) {
  const m = window.dadosMateriais && window.dadosMateriais[materialId];
  if (!m) throw new Error(`Material desconhecido: ${materialId}`);
  return m;
}

function listarMateriaisParaSelect() {
  const keys = Object.keys(window.dadosMateriais || {});
  keys.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return keys.map((id) => ({
    id,
    nome: (window.dadosMateriais[id] && window.dadosMateriais[id].nome) || id,
  }));
}

/**
 * Chapas ativas para cálculo: [{ largura, comprimento, indice }]
 */
function obterEntradasChapasAtivas(materialId) {
  const chapas = (window.chapasDisponiveis && window.chapasDisponiveis[materialId]) || [];
  const ativas = (window.chapasAtivas && window.chapasAtivas[materialId]) || [];
  const entradas = [];
  chapas.forEach((par, i) => {
    if (ativas[i] === false) return;
    const larguraChapa = par[0];
    const comprimentoChapa = par[1];
    entradas.push({ larguraChapa, comprimentoChapa, indice: i });
  });
  return entradas;
}

carregarConfiguracaoDoArmazenamento();
