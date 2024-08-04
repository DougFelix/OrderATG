import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quantidade',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './quantidade.component.html',
  styleUrl: './quantidade.component.css',
})
export class QuantidadeComponent {
  @Input() quantidade: number | undefined;
  @Output() quantidadeChanged = new EventEmitter<number>();
  @Output() isValid = new EventEmitter<boolean>();
  quantidadeValida: boolean = true;

  alterarQuantidade(quantidade: number) {
    this.quantidade = quantidade;
    this.quantidadeChanged.emit(this.quantidade);
    this.quantidadeValida =
      this.quantidade > 0 &&
      Number.isInteger(this.quantidade) &&
      this.quantidade < 100000;
    this.isValid.emit(this.quantidadeValida);
  }

  onBlur() {
    if (!this.quantidadeValida) this.quantidade = undefined;
  }
}
