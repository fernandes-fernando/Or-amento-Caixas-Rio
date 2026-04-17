/**
 * Motor de cálculo — planificação, otimização por sobra, rateio e preço.
 */

/**
 * Arredondamento comercial: ex. 1.605 → 1.65 (próximo centavo múltiplo de 0,05 para cima).
 */
function arredondarComercial(valor) {
  return Math.ceil(Number(valor) * 20) / 20;
}

/**
 * Avalia uma chapa [larguraChapa, comprimentoChapa] em mm.
 * @returns {object|null} Dados completos ou null se inviável.
 */
function avaliarChapa(comp, larg, alt, materialId, quantidade, larguraChapa, comprimentoChapa, indiceChapa) {
  const material = obterMaterial(materialId);
  const moldeL = larg + alt + 11;
  const moldeC = (comp + larg) * 2 + 63;

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
  const custo = peso * APP_CONFIG.precoPorKg;
  const precoUnitario = arredondarComercial(custo * APP_CONFIG.pontuacao);
  const precoTotal = precoUnitario * quantidade;

  return {
    indiceChapa,
    larguraChapa,
    comprimentoChapa,
    dimensoesLabel: `${larguraChapa} × ${comprimentoChapa} mm`,
    moldeL,
    moldeC,
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
 * Passo 1–4: percorre todas as chapas do material e retorna a de menor sobraPorCaixa.
 */
function calcularMelhorOpcao(comp, larg, alt, materialId, quantidade) {
  const material = obterMaterial(materialId);
  let melhor = null;

  material.chapas.forEach((chapa, indiceChapa) => {
    const [larguraChapa, comprimentoChapa] = chapa;
    const op = avaliarChapa(
      comp,
      larg,
      alt,
      materialId,
      quantidade,
      larguraChapa,
      comprimentoChapa,
      indiceChapa
    );
    if (!op) return;
    if (!melhor || op.sobraPorCaixa < melhor.sobraPorCaixa) {
      melhor = op;
    }
  });

  return melhor;
}

/**
 * Todas as chapas viáveis, ordenadas por preço unitário (crescente).
 */
function listarOpcoesPorPrecoUnitario(comp, larg, alt, materialId, quantidade) {
  const material = obterMaterial(materialId);
  const lista = [];

  material.chapas.forEach((chapa, indiceChapa) => {
    const [larguraChapa, comprimentoChapa] = chapa;
    const op = avaliarChapa(
      comp,
      larg,
      alt,
      materialId,
      quantidade,
      larguraChapa,
      comprimentoChapa,
      indiceChapa
    );
    if (op) lista.push(op);
  });

  lista.sort((a, b) => a.precoUnitario - b.precoUnitario);
  return lista;
}
