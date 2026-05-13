// =========================
// NAVEGAÇÃO ENTRE PÁGINAS
// =========================
const SUPABASE_URL = "https://xsyzptgcpxjitkjcsqnk.supabase.co";
const SUPABASE_ANON_KEY = "COsb_publishable_CSOy_gYLE6wRROlKjtAlVg_bxEFfF_Z";


const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// NAVEGAÇÃO
// =========================
function abrirPagina(paginaId, botao) {
  document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
  document.getElementById(paginaId).classList.add("ativa");

  document.querySelectorAll(".menu-btn").forEach(btn => btn.classList.remove("active"));
  botao.classList.add("active");

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
// CALCULADORA
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
  const precoVendaFinal = vendaInput && vendaInput > 0 ? vendaInput : precoSugerido;

  const taxaShopee = (precoVendaFinal * comissao / 100) + taxaFixa;
  const valorLiquido = precoVendaFinal - taxaShopee;
  const lucroFinal = valorLiquido - custoTotal;

  document.getElementById("resultado").innerHTML = `
    <strong>Custo Material:</strong> R$ ${custoMaterial.toFixed(2)}<br>
    <strong>Embalagem:</strong> R$ ${embalagem.toFixed(2)}<br>
    <strong>Custo Total:</strong> R$ ${custoTotal.toFixed(2)}<br><br>

    <div class="preco">
      <strong>Preço Sugerido:</strong> R$ ${precoSugerido.toFixed(2)}
    </div>

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
// PRODUTOS
// =========================
async function salvarProduto() {
  const nome = document.getElementById("produtoNome").value.trim();
  const sku = document.getElementById("produtoSku").value.trim();
  const custo = parseFloat(document.getElementById("produtoCusto").value) || 0;
  const preco = parseFloat(document.getElementById("produtoPreco").value) || 0;
  const quantidade = parseInt(document.getElementById("produtoQuantidade").value) || 0;

  if (!nome) {
    alert("Preencha o nome do produto.");
    return;
  }

  const { error } = await supabase.from("produtos").insert([
    {
      nome,
      sku,
      custo,
      preco,
      quantidade
    }
  ]);

  if (error) {
    alert("Erro ao salvar produto: " + error.message);
    return;
  }

  document.getElementById("produtoNome").value = "";
  document.getElementById("produtoSku").value = "";
  document.getElementById("produtoCusto").value = "";
  document.getElementById("produtoPreco").value = "";
  document.getElementById("produtoQuantidade").value = "";

  await carregarProdutos();
  await atualizarSelectProdutos();
  await atualizarDashboard();

  alert("Produto salvo com sucesso!");
}

async function carregarProdutos() {
  const tabela = document.getElementById("tabelaProdutos");
  tabela.innerHTML = "";

  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    tabela.innerHTML = `<tr><td colspan="6">Erro ao carregar produtos.</td></tr>`;
    return;
  }

  data.forEach(produto => {
    tabela.innerHTML += `
      <tr>
        <td>${produto.nome || ""}</td>
        <td>${produto.sku || ""}</td>
        <td>R$ ${Number(produto.custo || 0).toFixed(2)}</td>
        <td>R$ ${Number(produto.preco || 0).toFixed(2)}</td>
        <td>${produto.quantidade || 0}</td>
        <td>
          <button class="btn-excluir" onclick="excluirProduto('${produto.id}')">
            Excluir
          </button>
        </td>
      </tr>
    `;
  });
}

async function excluirProduto(id) {
  if (!confirm("Deseja excluir este produto?")) return;

  const { error } = await supabase
    .from("produtos")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erro ao excluir produto: " + error.message);
    return;
  }

  await carregarProdutos();
  await atualizarSelectProdutos();
  await atualizarDashboard();
}

// =========================
// SELECT PRODUTOS
// =========================
async function atualizarSelectProdutos() {
  const select = document.getElementById("pedidoProduto");
  select.innerHTML = `<option value="">Selecione um produto</option>`;

  const { data, error } = await supabase
    .from("produtos")
    .select("id, nome")
    .order("nome", { ascending: true });

  if (error) return;

  data.forEach(produto => {
    select.innerHTML += `
      <option value="${produto.id}" data-nome="${produto.nome}">
        ${produto.nome}
      </option>
    `;
  });
}

// =========================
// PEDIDOS
// =========================
async function salvarPedido() {
  const numeroPedido = document.getElementById("pedidoNumero").value.trim();
  const produtoId = document.getElementById("pedidoProduto").value;
  const produtoNome = document.getElementById("pedidoProduto").selectedOptions[0]?.dataset.nome || "";
  const quantidade = parseInt(document.getElementById("pedidoQuantidade").value) || 0;
  const valorTotal = parseFloat(document.getElementById("pedidoValor").value) || 0;
  const dataVenda = document.getElementById("pedidoDataVenda").value || null;
  const dataEntrega = document.getElementById("pedidoDataEntrega").value || null;
  const status = document.getElementById("pedidoStatus").value;

  if (!numeroPedido || !produtoId) {
    alert("Preencha o número do pedido e selecione o produto.");
    return;
  }

  const { error } = await supabase.from("pedidos").insert([
    {
      numero_pedido: numeroPedido,
      produto_id: produtoId,
      produto_nome: produtoNome,
      quantidade,
      valor_total: valorTotal,
      data_venda: dataVenda,
      data_entrega: dataEntrega,
      status
    }
  ]);

  if (error) {
    alert("Erro ao salvar pedido: " + error.message);
    return;
  }

  document.getElementById("pedidoNumero").value = "";
  document.getElementById("pedidoProduto").value = "";
  document.getElementById("pedidoQuantidade").value = "";
  document.getElementById("pedidoValor").value = "";
  document.getElementById("pedidoDataVenda").value = "";
  document.getElementById("pedidoDataEntrega").value = "";

  await carregarPedidos();
  await atualizarDashboard();

  alert("Pedido salvo com sucesso!");
}

async function carregarPedidos() {
  const tabela = document.getElementById("tabelaPedidos");
  tabela.innerHTML = "";

  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    tabela.innerHTML = `<tr><td colspan="8">Erro ao carregar pedidos.</td></tr>`;
    return;
  }

  data.forEach(pedido => {
    tabela.innerHTML += `
      <tr>
        <td>${pedido.numero_pedido || ""}</td>
        <td>${pedido.produto_nome || ""}</td>
        <td>${pedido.quantidade || 0}</td>
        <td>R$ ${Number(pedido.valor_total || 0).toFixed(2)}</td>
        <td>${pedido.data_venda || ""}</td>
        <td>${pedido.data_entrega || ""}</td>
        <td>${pedido.status || ""}</td>
        <td>
          <button class="btn-excluir" onclick="excluirPedido('${pedido.id}')">
            Excluir
          </button>
        </td>
      </tr>
    `;
  });
}

async function excluirPedido(id) {
  if (!confirm("Deseja excluir este pedido?")) return;

  const { error } = await supabase
    .from("pedidos")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erro ao excluir pedido: " + error.message);
    return;
  }

  await carregarPedidos();
  await atualizarDashboard();
}

// =========================
// DASHBOARD
// =========================
async function atualizarDashboard() {
  const { data: produtos } = await supabase.from("produtos").select("*");
  const { data: pedidos } = await supabase.from("pedidos").select("*");

  const listaProdutos = produtos || [];
  const listaPedidos = pedidos || [];

  let totalQuantidade = 0;
  let totalFaturamento = 0;

  listaPedidos.forEach(pedido => {
    totalQuantidade += Number(pedido.quantidade || 0);
    totalFaturamento += Number(pedido.valor_total || 0);
  });

  document.getElementById("totalProdutos").innerText = listaProdutos.length;
  document.getElementById("totalPedidos").innerText = listaPedidos.length;
  document.getElementById("totalQuantidade").innerText = totalQuantidade;
  document.getElementById("totalFaturamento").innerText =
    `R$ ${totalFaturamento.toFixed(2)}`;
}

// =========================
// INICIAR SISTEMA
// =========================
window.onload = async function () {
  await carregarProdutos();
  await carregarPedidos();
  await atualizarSelectProdutos();
  await atualizarDashboard();
};