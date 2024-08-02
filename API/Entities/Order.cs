using System;
using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Order
{
    [Key]
    public int Id { get; set; }
    public string Ativo { get; set; }
    public string Lado { get; set; }
    public int Quantidade { get; set; }
    public decimal Preco { get; set; }
    public DateTime RecOn { get; set; }
}