namespace API.Entities;

public class Response
{
    public bool Sucesso { get; set; }
    public decimal? Exposicao_atual { get; set; }
    public string Msg_erro { get; set; }
}