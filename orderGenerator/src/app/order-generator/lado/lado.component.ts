import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lado',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './lado.component.html',
})
export class LadoComponent {
  @Input() ladoSelected!: string;
  @Output() ladoChanged = new EventEmitter<string>();

  ladoSelecionadoChanged(lado: string) {
    this.ladoSelected = lado;
    this.ladoChanged.emit(this.ladoSelected);
  }
}
