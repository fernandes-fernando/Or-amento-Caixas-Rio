/**
 * Motor de cálculo — planificação, otimização por sobra, rateio e preço.
 * Usa window.dadosMateriais e chapas ativas (Painel de Configurações).
 */

/**
 * Arredondamento comercial: ex. 1.605 → 1.65 (próximo centavo múltiplo de 0,05 para cima).
 */
function arredondarComercial(valor) {
  return Math.ceil(Number(valor) * 20) / 20;
}

/**
 * Avalia uma chapa em mm. ignora índices desativados no painel (via obterEntradasChapasAtivas).
 * @returns {object|null} Dados completos ou null se inviável.
 */
function avaliarChapa(
  comp,
  larg,
  alt,
  materialId,
  quantidade,
  larguraChapa,
  comprimentoChapa,
  indiceChapa
) {
  const material = obterMaterial(materialId);

  const moldeL = larg + alt + 11;
  const moldeC = (comp + larg) * 2 + 63;
  const areaMoldeM2 = (moldeL * moldeC) / 1_000_000;

  const caixasL = Math.floor(larguraChapa / moldeL);
  const caixasC = Math.floor(comprimentoChapa / moldeC);
  const maximoCaixas = caixasL * caixasC;

  if (maximoCaixas <= 0 || caixasL <= 0 || caixasC <= 0) {
    return null;
  }

  const areaDaChapa = larguraChapa * comprimentoChapa;
  const areaUsada = maximoCaixas * moldeL * moldeC;
  const sobraPorCaixa = (areaDaChapa - areaUsada) / maximoCaixas;

  const fracaoL = larguraChapa / caixasL;
  const fracaoC = comprimentoChapa / caixasC;
  const areaCobrada = (fracaoL * fracaoC) / 1_000_000;

  const peso = areaCobrada * material.pesoM2;
  const custo = peso * material.precoPorKg;
  const precoUnitario = arredondarComercial(custo * material.pontuacao);
  const precoTotal = precoUnitario * quantidade;

  return {
    indiceChapa,
    larguraChapa,
    comprimentoChapa,
    dimensoesLabel: `${larguraChapa} × ${comprimentoChapa} mm`,
    moldeL,
    moldeC,
    areaMoldeM2,
    caixasL,
    caixasC,
    maximoCaixas,
    sobraPorCaixa,
    fracaoL,
    fracaoC,
    areaCobrada,
    peso,
    custo,
    precoUnitario,
    precoTotal,
    quantidade,
    materialId,
    materialNome: material.nome,
    pesoM2: material.pesoM2,
  };
}

/**
 * Melhor opção = menor sobra por caixa entre chapas ativas.
 */
function calcularMelhorOpcao(comp, larg, alt, materialId, quantidade) {
  const entradas = obterEntradasChapasAtivas(materialId);
  let melhor = null;

  entradas.forEach(({ larguraChapa, comprimentoChapa, indice }) => {
    const op = avaliarChapa(
      comp,
      larg,
      alt,
      materialId,
      quantidade,
      larguraChapa,
      comprimentoChapa,
      indice
    );
    if (!op) return;
    if (!melhor || op.sobraPorCaixa < melhor.sobraPorCaixa) {
      melhor = op;
    }
  });

  return melhor;
}

/**
 * Opções viáveis: ordenação por menor desperdício (sobra/caixa), desempate por menor preço unitário.
 * Nota: menor sobra nem sempre implica menor preço (o rateio por grade altera a área cobrada por caixa).
 */
function listarOpcoesPorPrecoUnitario(comp, larg, alt, materialId, quantidade) {
  const entradas = obterEntradasChapasAtivas(materialId);
  const lista = [];

  entradas.forEach(({ larguraChapa, comprimentoChapa, indice }) => {
    const op = avaliarChapa(
      comp,
      larg,
      alt,
      materialId,
      quantidade,
      larguraChapa,
      comprimentoChapa,
      indice
    );
    if (op) lista.push(op);
  });

  lista.sort((a, b) => {
    if (a.sobraPorCaixa !== b.sobraPorCaixa) {
      return a.sobraPorCaixa - b.sobraPorCaixa;
    }
    return a.precoUnitario - b.precoUnitario;
  });
  return lista;
}

/**
 * Desconto aplicado apenas sobre o subtotal dos itens.
 * Subtotal com desconto = subtotal × (1 − %/100).
 * Total geral = subtotal com desconto + frete + custo faca + custo clichê (custos sem desconto).
 */
function normalizarPercentualDesconto(descontoPercentual) {
  let d = Number(descontoPercentual);
  if (!Number.isFinite(d)) d = 0;
  return Math.max(0, Math.min(100, d));
}

function calcularValorDescontoEmReais(subtotal, descontoPercentual) {
  const d = normalizarPercentualDesconto(descontoPercentual);
  const sub = Math.max(0, Number(subtotal) || 0);
  return sub * (d / 100);
}

function calcularSubtotalAposDesconto(subtotal, descontoPercentual) {
  const d = normalizarPercentualDesconto(descontoPercentual);
  const sub = Math.max(0, Number(subtotal) || 0);
  return sub * (1 - d / 100);
}

function calcularTotalGeralOrcamento(subtotal, descontoPercentual, frete, custoFaca, custoCliche) {
  const subLiq = calcularSubtotalAposDesconto(subtotal, descontoPercentual);
  const f = Math.max(0, Number(frete) || 0);
  const cf = Math.max(0, Number(custoFaca) || 0);
  const cc = Math.max(0, Number(custoCliche) || 0);
  return subLiq + f + cf + cc;
}

/**
 * Campos técnicos para OP (persistidos em ui.js a partir do retorno de avaliarChapa):
 * moldeL, moldeC, chapaEscolhida (ex.: "1250x1070"), caixasPorChapa (maximoCaixas).
 */

/**
 * Histórico de orçamentos (localStorage `historico_caixas_rio`, chave `orcamento_caixas_proximo_numero`): lógica em ui.js.
 * Dashboard de métricas, status do pedido e origem do cliente: ui.js.
 */

/** Rótulo do material na proposta impressa: Duplex onda * → Duplex. */
function materialRotuloImpressao(nomeMaterial) {
  const n = String(nomeMaterial || '').trim();
  if (n === 'Duplex onda baixa' || n === 'Duplex onda alta') return 'Duplex';
  return n;
}
