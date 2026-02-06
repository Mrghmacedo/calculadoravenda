function calcular() {

  const peso = parseFloat(document.getElementById("peso").value) || 0;
  const valorKg = parseFloat(document.getElementById("valorKg").value) || 0;
  const embalagem = parseFloat(document.getElementById("embalagem").value) || 0;
  const margem = parseFloat(document.getElementById("margem").value) || 0;
  const comissao = parseFloat(document.getElementById("comissao").value) || 0;
  const taxaFixa = parseFloat(document.getElementById("taxaFixa").value) || 0;
  const vendaInput = parseFloat(document.getElementById("venda").value);

  // ----- CUSTOS -----
  const custoMaterial = (peso / 1000) * valorKg;
  const custoTotal = custoMaterial + embalagem;

  // ----- PREÇO SUGERIDO (SEMPRE CALCULADO) -----
  const precoComLucro = custoTotal * (1 + margem / 100);
  const precoSugerido = (precoComLucro + taxaFixa) / (1 - comissao / 100);

  // ----- PREÇO FINAL PARA CÁLCULO -----
  const precoVendaFinal = (vendaInput && vendaInput > 0)
    ? vendaInput
    : precoSugerido;

  // ----- TAXAS -----
  const taxaShopee = (precoVendaFinal * comissao / 100) + taxaFixa;
  const valorLiquido = precoVendaFinal - taxaShopee;
  const lucroFinal = valorLiquido - custoTotal;

  // ----- RESULTADO -----
  document.getElementById("resultado").innerHTML = `
    <div class="custo">
      <strong>Custo Material:</strong> R$ ${custoMaterial.toFixed(2)}<br>
      <strong>Embalagem:</strong> R$ ${embalagem.toFixed(2)}<br>
      <strong>Custo Total:</strong> R$ ${custoTotal.toFixed(2)}
    </div><br>

    <div class="preco">
      <strong>Preço de Venda Sugerido:</strong> R$ ${precoSugerido.toFixed(2)}
    </div>

    ${vendaInput && vendaInput > 0 ? `
    <div class="preco">
      <strong>Preço de Venda Informado:</strong> R$ ${vendaInput.toFixed(2)}
    </div>` : ``}

    <div class="taxas">
      <strong>Taxas Shopee:</strong> R$ ${taxaShopee.toFixed(2)}
    </div>

    <div class="liquido">
      <strong>Valor Líquido:</strong> R$ ${valorLiquido.toFixed(2)}
    </div>

    <div class="lucro">
      <strong>Lucro Final:</strong> R$ ${lucroFinal.toFixed(2)}
    </div>
  `;
}
