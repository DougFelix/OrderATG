using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderAccumulatorController : ControllerBase
{
    const decimal Limit = 1000000.00m;
    private readonly Dictionary<string, string> _lados = new() { { "Compra", "C" }, { "Venda", "V" } };
    private readonly string[] _ativos = { "PETR4", "VALE3", "VIIA4" };
    private readonly DataContext _context;

    public OrderAccumulatorController(DataContext context)
    {
        _context = context;
    }

    [HttpDelete]
    public async void Reset()
    {
        await _context.Orders.ExecuteDeleteAsync();
    }

    [HttpPost]
    public IActionResult Post([FromBody] Order order)
    {
        var response = new Response();

        try
        {
            ValidateOrder(order);

            var exposicaoFinanceiraAtual = GetExposicaoFinanceiraAtual(order.Ativo);
            exposicaoFinanceiraAtual = ValidarNovaExposicaoFinanceira(order, exposicaoFinanceiraAtual);
            SaveOrder(order);

            response.Sucesso = true;
            response.Exposicao_atual = exposicaoFinanceiraAtual;
            return Ok(response);
        }
        catch (Exception ex)
        {
            response.Sucesso = false;
            response.Msg_erro = ex.Message;
            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }
    }

    private void ValidateOrder(Order order)
    {
        if (order?.Ativo == null || order.Ativo == string.Empty || order.Lado == null || order.Lado == string.Empty)
            throw new ArgumentException($"não é possível realizar a operação com dados incompletos.");
        if (!_ativos.Contains(order.Ativo))
            throw new ArgumentException($"o ativo {order.Ativo} é inválido. Deve ser 'PETR4' , 'VALE3' ou 'VIIA4'.");
        if (!_lados.ContainsValue(order.Lado))
            throw new ArgumentException($"o lado {order.Lado} é inválido. Deve ser 'C' ou 'V'.");
        if (order.Quantidade <= 0 || order.Quantidade >= 100000)
            throw new ArgumentException($"a quantidade {order.Quantidade} deve ser valor positivo inteiro menor que 100.000.");
        if (order.Preco <= 0 || order.Preco >= 1000 || order.Preco % 0.01m != 0)
            throw new ArgumentException($"o preço {order.Preco} deve ser valor positivo decimal múltiplo de 0.01 e menor que 1.000,00.");
    }

    private decimal ValidarNovaExposicaoFinanceira(Order order, decimal exposicaoFinanceiraAtual)
    {
        var novoValor = GetOrderValue(order);
        exposicaoFinanceiraAtual += novoValor;
        if (exposicaoFinanceiraAtual > Limit)
            throw new InvalidOperationException($"a order informada ultrapassaria R${novoValor} do limite de R$1.000.000,00 para a exposição financeira.");

        return exposicaoFinanceiraAtual;
    }

    private decimal GetOrderValue(Order order)
    {
        if (order.Lado == _lados["Compra"])
            return order.Preco * order.Quantidade;
        else return (-1) * order.Preco * order.Quantidade;
    }

    private decimal GetExposicaoFinanceiraAtual(string ativo)
    {
        decimal exposicaoFinanceiraAtual = 0;
        List<Order> orders = GetOrderList(ativo).Result;
        if (orders.Count > 0)
            orders.ForEach(order => exposicaoFinanceiraAtual += GetOrderValue(order));

        return exposicaoFinanceiraAtual;
    }

    private async Task<List<Order>> GetOrderList(string ativo)
    {
        var orders = await _context.Orders.Where(o => o.Ativo == ativo).ToListAsync();
        return orders;
    }

    private void SaveOrder(Order order)
    {
        order.RecOn = DateTime.Now;
        _context.Orders.Add(order);
    }
}
