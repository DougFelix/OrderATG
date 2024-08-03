import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderGeneratorService } from './order-generator.service';
import { Order } from '../_models/order';

@Component({
  selector: 'app-order-generator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './order-generator.component.html',
  styleUrl: './order-generator.component.css',
})
export class OrderGeneratorComponent {
  ativoSelecionado: string = 'PETR4';
  ladoSelecionado: string = 'c';
  quantidadeInformada!: number;
  precoInformado!: number;
  textoResposta: string = '';

  constructor(private service: OrderGeneratorService) {}

  enviar() {
    let order: Order = {
      Lado: this.ladoSelecionado,
      Ativo: this.ativoSelecionado,
      Quantidade: this.quantidadeInformada,
      Preco: this.precoInformado,
    };

    validateOrder(order);

    this.service
      .enviar(order)
      .subscribe((response) => (this.textoResposta = response));
  }
}

function validateOrder(order: Order) {
  throw new Error('Function not implemented.');
}
