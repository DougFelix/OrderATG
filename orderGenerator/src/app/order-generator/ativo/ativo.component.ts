import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ativo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ativo.component.html',
})
export class AtivoComponent {
  @Input() ativoSelected!: string;
  @Output() ativoChanged = new EventEmitter<string>();

  ativoSelectedChanged(ativo: string) {
    this.ativoSelected = ativo;
    this.ativoChanged.emit(this.ativoSelected);
  }
}
