import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Cleave from 'cleave.js';

@Component({
  selector: 'app-preco',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './preco.component.html',
})
export class PrecoComponent implements OnInit {
  private cleave!: Cleave;
  @Input() preco: number | undefined;
  @Output() precoChanged = new EventEmitter<number>();
  @Output() isValid = new EventEmitter<boolean>();
  precoValido: boolean = true;

  ngOnInit() {
    this.cleave = new Cleave('#inputDinheiro', {
      numeral: true,
      numeralThousandsGroupStyle: 'thousand',
      prefix: 'R$ ',
      numeralDecimalMark: ',',
      delimiter: '.',
    });
  }

  onValueChange(event: any) {
    const formattedValue = event.target.value;
    const numericValue = parseFloat(
      formattedValue.replace(/[^\d,]/g, '').replace(',', '.')
    );
    this.preco = isNaN(numericValue) ? 0 : numericValue;
    
    this.precoChanged.emit(this.preco);

    this.precoValido =
      this.preco != undefined &&
      this.preco > 0 &&
      this.preco < 1000 &&
      Math.round(this.preco * 100) % 1 === 0;
    this.isValid.emit(this.precoValido);
  }

  onBlur() {
    if (!this.precoValido) this.preco = undefined;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
