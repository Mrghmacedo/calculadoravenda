// =========================
// NAVEGAÇÃO ENTRE PÁGINAS
// =========================
function abrirPagina(paginaId, botao) {
  document.querySelectorAll('.pagina').forEach(pagina => {
    pagina.classList.remove('ativa');
  });

  document.getElementById(paginaId).classList.add('ativa');

  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  botao.classList.add('active');

  const titulos = {
    dashboard: "Dashboard",
    calculadora: "Calculadora de Venda",
    produtos: "Cadastro de Produtos",
    pedidos: "Pedidos Shopee"
  };

  document.getElementById("tituloPagina").innerText = titulos[paginaId];

  atualizarDashboard();
}

// =========================
// CALCULADORA SHOPEE
// =========================
function calcular() {
  const peso = parseFloat(document.getElementById("peso").value) || 0;
  const valorKg = parseFloat(document.getElementById("valorKg").value) || 0;
  const embalagem = parseFloat(document.getElementById("embalagem").value) || 0;
  const margem = parseFloat(document.getElementById("margem").value) || 0;
  const comissao = parseFloat(document.getElementById("comissao").value) || 0;
  const taxaFixa = parseFloat(document.getElementById("taxaFixa").value) || 0;
  const vendaInput = parseFloat(document.getElementById("venda").value);

  const custoMaterial = (peso / 1000) * valorKg;
  const custoTotal = custoMaterial + embalagem;

  const precoComLucro = custoTotal * (1 + margem / 100);
  const precoSugerido = (precoComLucro + taxaFixa) / (1 - comissao / 100);

  const precoVendaFinal = (vendaInput && vendaInput > 0)
    ? vendaInput
    : precoSugerido;

  const taxaShopee = (precoVendaFinal * comissao / 100) + taxaFixa;
  const valorLiquido = precoVendaFinal - taxaShopee;
  const lucroFinal = valorLiquido - custoTotal;

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

// =========================
// LOCAL STORAGE
// =========================
function obterProdutos() {
  return JSON.parse(localStorage.getItem("produtosShopee")) || [];
}

function salvarProdutos(produtos) {
  localStorage.setItem("produtosShopee", JSON.stringify(produtos));
}

function obterPedidos() {
  return JSON.parse(localStorage.getItem("pedidosShopee")) || [];
}

function salvarPedidos(pedidos) {
  localStorage.setItem("pedidosShopee", JSON.stringify(pedidos));
}

// =========================
// PRODUTOS
// =========================
function salvarProduto() {
  const nome = document.getElementById("produtoNome").value.trim();
  const sku = document.getElementById("produtoSku").value.trim();
  const custo = parseFloat(document.getElementById("produtoCusto").value) || 0;
  const preco = parseFloat(document.getElementById("produtoPreco").value) || 0;
  const quantidade = parseInt(document.getElementById("produtoQuantidade").value) || 0;

  if (!nome || !sku) {
    alert("Preencha nome e SKU.");
    return;
  }

  const produtos = obterProdutos();

  produtos.push({
    id: Date.now(),
    nome,
    sku,
    custo,
    preco,
    quantidade
  });

  salvarProdutos(produtos);
  renderizarProdutos();
  atualizarSelectProdutos();
  atualizarDashboard();

  document.getElementById("produtoNome").value = "";
  document.getElementById("produtoSku").value = "";
  document.getElementById("produtoCusto").value = "";
  document.getElementById("produtoPreco").value = "";
  document.getElementById("produtoQuantidade").value = "";
}

function renderizarProdutos() {
  const tabela = document.getElementById("tabelaProdutos");
  tabela.innerHTML = "";

  const produtos = obterProdutos();

  produtos.forEach(produto => {
    tabela.innerHTML += `
      <tr>
        <td>${produto.nome}</td>
        <td>${produto.sku}</td>
        <td>R$ ${produto.custo.toFixed(2)}</td>
        <td>R$ ${produto.preco.toFixed(2)}</td>
        <td>${produto.quantidade}</td>
        <td>
          <button class="btn-excluir" onclick="excluirProduto(${produto.id})">
            Excluir
          </button>
        </td>
      </tr>
    `;
  });
}

function excluirProduto(id) {
  let produtos = obterProdutos();
  produtos = produtos.filter(produto => produto.id !== id);
  salvarProdutos(produtos);
  renderizarProdutos();
  atualizarSelectProdutos();
  atualizarDashboard();
}

// =========================
// SELECT PRODUTOS
// =========================
function atualizarSelectProdutos() {
  const select = document.getElementById("pedidoProduto");
  select.innerHTML = '<option value="">Selecione um produto</option>';

  const produtos = obterProdutos();

  produtos.forEach(produto => {
    select.innerHTML += `
      <option value="${produto.nome}">
        ${produto.nome}
      </option>
    `;
  });
}

// =========================
// PEDIDOS
// =========================
function salvarPedido() {
  const numero = document.getElementById("pedidoNumero").value.trim();
  const produto = document.getElementById("pedidoProduto").value;
  const quantidade = parseInt(document.getElementById("pedidoQuantidade").value) || 0;
  const valor = parseFloat(document.getElementById("pedidoValor").value) || 0;
  const dataVenda = document.getElementById("pedidoDataVenda").value;
  const dataEntrega = document.getElementById("pedidoDataEntrega").value;
  const status = document.getElementById("pedidoStatus").value;

  if (!numero || !produto) {
    alert("Preencha pedido e produto.");
    return;
  }

  const pedidos = obterPedidos();

  pedidos.push({
    id: Date.now(),
    numero,
    produto,
    quantidade,
    valor,
    dataVenda,
    dataEntrega,
    status
  });

  salvarPedidos(pedidos);
  renderizarPedidos();
  atualizarDashboard();

  document.getElementById("pedidoNumero").value = "";
  document.getElementById("pedidoQuantidade").value = "";
  document.getElementById("pedidoValor").value = "";
  document.getElementById("pedidoDataVenda").value = "";
  document.getElementById("pedidoDataEntrega").value = "";
}

function renderizarPedidos() {
  const tabela = document.getElementById("tabelaPedidos");
  tabela.innerHTML = "";

  const pedidos = obterPedidos();

  pedidos.forEach(pedido => {
    tabela.innerHTML += `
      <tr>
        <td>${pedido.numero}</td>
        <td>${pedido.produto}</td>
        <td>${pedido.quantidade}</td>
        <td>R$ ${pedido.valor.toFixed(2)}</td>
        <td>${pedido.dataVenda}</td>
        <td>${pedido.dataEntrega}</td>
        <td>${pedido.status}</td>
        <td>
          <button class="btn-excluir" onclick="excluirPedido(${pedido.id})">
            Excluir
          </button>
        </td>
      </tr>
    `;
  });
}

function excluirPedido(id) {
  let pedidos = obterPedidos();
  pedidos = pedidos.filter(pedido => pedido.id !== id);
  salvarPedidos(pedidos);
  renderizarPedidos();
  atualizarDashboard();
}

// =========================
// DASHBOARD
// =========================
function atualizarDashboard() {
  const produtos = obterProdutos();
  const pedidos = obterPedidos();

  const totalProdutos = produtos.length;
  const totalPedidos = pedidos.length;

  let totalQuantidade = 0;
  let totalFaturamento = 0;

  pedidos.forEach(pedido => {
    totalQuantidade += pedido.quantidade;
    totalFaturamento += pedido.valor;
  });

  document.getElementById("totalProdutos").innerText = totalProdutos;
  document.getElementById("totalPedidos").innerText = totalPedidos;
  document.getElementById("totalQuantidade").innerText = totalQuantidade;
  document.getElementById("totalFaturamento").innerText =
    `R$ ${totalFaturamento.toFixed(2)}`;
}

// =========================
// INICIALIZAÇÃO
// =========================
window.onload = function () {
  renderizarProdutos();
  renderizarPedidos();
  atualizarSelectProdutos();
  atualizarDashboard();
};