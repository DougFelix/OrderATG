using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
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
        await _context.SaveChangesAsync();
    }

    [HttpGet]
    public ActionResult<List<Order>> GetList()
    {
        var orders = _context.Orders.ToList();
        return orders;
    }

    [HttpGet("expofinanceira")]
    public async Task<ActionResult<Dictionary<string, decimal>>> GetExposicaoFinanceira()
    {
        var exposicaoFinanceira = new Dictionary<string, decimal> { { "PETR4", 0m }, { "VALE3", 0m }, { "VIIA4", 0m } };
        var orders = await _context.Orders.ToListAsync();

        foreach (var order in orders)
            if (exposicaoFinanceira.ContainsKey(order.Ativo))
                exposicaoFinanceira[order.Ativo] += GetOrderValue(order);

        return Ok(exposicaoFinanceira);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Order order)
    {
        var response = new Response();

        try
        {
            ValidateOrder(order);

            var exposicaoFinanceiraAtual = GetExposicaoFinanceiraAtualPorAtivo(order.Ativo);
            exposicaoFinanceiraAtual = ValidarNovaExposicaoFinanceira(order, exposicaoFinanceiraAtual);
            await SaveOrder(order);

            response.Sucesso = true;
            response.Exposicao_atual = exposicaoFinanceiraAtual;
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            response.Sucesso = false;
            response.Msg_erro = "Erro aconteceu porque " + ex.Message;
            return StatusCode(StatusCodes.Status400BadRequest, response);
        }
        catch (InvalidOperationException ex)
        {
            response.Sucesso = false;
            response.Msg_erro = "Erro aconteceu porque " + ex.Message;
            return StatusCode(StatusCodes.Status400BadRequest, response);
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
            throw new ArgumentException($"o ativo informado ({order.Ativo}) é inválido. Deve ser 'PETR4' , 'VALE3' ou 'VIIA4'.");
        if (!_lados.ContainsValue(order.Lado))
            throw new ArgumentException($"o lado informado ({order.Lado}) é inválido. Deve ser 'C' ou 'V'.");
        if (order.Quantidade <= 0 || order.Quantidade >= 100000)
            throw new ArgumentException($"a quantidade informada ({order.Quantidade}) deve ser valor positivo inteiro menor que 100.000.");
        if (order.Preco <= 0 || order.Preco >= 1000 || order.Preco % 0.01m != 0)
        {
            var precoFormatado = order.Preco.ToString("C", new CultureInfo("pt-BR"));
            throw new ArgumentException($"o preço informado ({precoFormatado}) deve ser um valor positivo decimal múltiplo de 0.01 e menor que R$1.000,00.");
        }
    }

    private decimal ValidarNovaExposicaoFinanceira(Order order, decimal exposicaoFinanceiraAtual)
    {
        var novoValor = GetOrderValue(order);
        exposicaoFinanceiraAtual += novoValor;
        if (exposicaoFinanceiraAtual > Limit)
        {
            var valorExtraFormatado = (exposicaoFinanceiraAtual - Limit).ToString("C", new CultureInfo("pt-BR"));
            throw new InvalidOperationException($"a order informada ultrapassaria {valorExtraFormatado} do limite de R$1.000.000,00 para a exposição financeira.");
        }

        return exposicaoFinanceiraAtual;
    }

    private decimal GetOrderValue(Order order)
    {
        if (order.Lado == _lados["Compra"])
            return order.Preco * order.Quantidade;
        else return (-1) * order.Preco * order.Quantidade;
    }

    private decimal GetExposicaoFinanceiraAtualPorAtivo(string ativo)
    {
        decimal exposicaoFinanceiraAtual = 0;
        List<Order> orders = GetOrderList(ativo).Result;
        if (orders.Count > 0)
            orders.ForEach(order => exposicaoFinanceiraAtual += GetOrderValue(order));

        return exposicaoFinanceiraAtual;
    }

    private async Task<List<Order>> GetOrderList(string ativo) => await _context.Orders.Where(o => o.Ativo == ativo).ToListAsync();

    private async Task<Order> SaveOrder(Order order)
    {
        order.RecOn = DateTime.Now;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }
}
