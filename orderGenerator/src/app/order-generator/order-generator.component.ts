import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderGeneratorService } from './order-generator.service';
import { Order } from '../_models/order';
import { AtivoComponent } from './ativo/ativo.component';
import { LadoComponent } from './lado/lado.component';
import { QuantidadeComponent } from './quantidade/quantidade.component';
import { PrecoComponent } from './preco/preco.component';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Result } from '../_models/response';

@Component({
  selector: 'app-order-generator',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    AtivoComponent,
    LadoComponent,
    QuantidadeComponent,
    PrecoComponent,
    CurrencyPipe,
  ],
  templateUrl: './order-generator.component.html',
  styleUrl: './order-generator.component.css',
})
export class OrderGeneratorComponent {
  ativoSelected: string = 'PETR4';
  ladoSelected: string = 'C';
  quantidadeInformada!: number;
  precoInformado!: number;
  resultado: Result | undefined;
  isQuantidadeValid: boolean = false;
  isPrecoValid: boolean = false;
  expoPETR4: number = 0;
  expoVALE3: number = 0;
  expoVIIA4: number = 0;

  constructor(private service: OrderGeneratorService) {
    this.carregarExposicoesFinanceiras();
  }

  isFormValid(): boolean {
    return this.isQuantidadeValid && this.isPrecoValid;
  }

  enviar() {
    let order: Order = {
      Lado: this.ladoSelected,
      Ativo: this.ativoSelected,
      Quantidade: this.quantidadeInformada,
      Preco: this.precoInformado,
    };

    this.service.enviar(order).subscribe({
      next: (response) => {
        this.resultado = response;
        this.atualizarExposicao(order.Ativo, this.resultado.exposicao_atual);
      },
      error: (error) => (this.resultado = error.error),
    });
  }

  getOrders() {
    this.service.getOrders().subscribe({
      next: (response) => console.log(response),
      error: (error) => console.log(error),
    });
  }

  carregarExposicoesFinanceiras() {
    this.getExposicaoFinanceira('PETR4');
    this.getExposicaoFinanceira('VALE3');
    this.getExposicaoFinanceira('VIIA4');
  }

  getExposicaoFinanceira(ativo: string) {
    this.service.getExposicaoFinanceira(ativo).subscribe({
      next: (response) => {
        this.atualizarExposicao(ativo, response);
      },
    });
  }

  resetar() {
    this.resultado = undefined;
    this.service
      .resetar()
      .subscribe({ complete: () => this.carregarExposicoesFinanceiras() });
  }

  atualizarExposicao(ativo: string, exposicao_atual: number | undefined) {
    if (exposicao_atual == undefined) return;

    if (ativo === 'PETR4') {
      this.expoPETR4 = exposicao_atual;
    } else if (ativo === 'VALE3') {
      this.expoVALE3 = exposicao_atual;
    } else if (ativo === 'VIIA4') {
      this.expoVIIA4 = exposicao_atual;
    }
  }
}
