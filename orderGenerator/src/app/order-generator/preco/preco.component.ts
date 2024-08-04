import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-preco',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './preco.component.html',
})
export class PrecoComponent {
  @Input() preco: number | undefined;
  @Output() precoChanged = new EventEmitter<number>();
  @Output() isValid = new EventEmitter<boolean>();
  precoValido: boolean = true;

  alterarPreco(preco: number) {
    this.preco = preco;
    this.precoChanged.emit(this.preco);

    this.precoValido =
      this.preco > 0 && this.preco < 1000 && Math.round(preco * 100) % 1 === 0;
    this.isValid.emit(this.precoValido);
  }

  onBlur() {
    if (!this.precoValido) this.preco = undefined;
  }
}
