/**
 * Banco de dados local — materiais, chapas e parâmetros comerciais.
 */
const APP_CONFIG = {
  senhaPadrao: 'caixas2026',
  precoPorKg: 7.5,
  pontuacao: 1.6,
  materiais: {
    'duplex-onda-baixa': {
      id: 'duplex-onda-baixa',
      nome: 'Duplex onda baixa',
      pesoM2: 0.342,
      chapas: [
        [1000, 1000],
        [1250, 1070],
        [1250, 1270],
        [1450, 1770],
      ],
    },
    'duplex-onda-alta': {
      id: 'duplex-onda-alta',
      nome: 'Duplex onda alta',
      pesoM2: 0.352,
      chapas: [
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
    },
    triplex: {
      id: 'triplex',
      nome: 'Triplex',
      pesoM2: 0.594,
      chapas: [
        [1550, 1770],
        [1300, 1700],
        [1300, 1300],
        [1050, 1180],
      ],
    },
  },
};

function obterMaterial(materialId) {
  const m = APP_CONFIG.materiais[materialId];
  if (!m) throw new Error(`Material desconhecido: ${materialId}`);
  return m;
}

function listarMateriaisParaSelect() {
  return Object.values(APP_CONFIG.materiais).map((m) => ({
    id: m.id,
    nome: m.nome,
  }));
}
