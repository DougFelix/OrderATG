import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OrderGeneratorComponent } from "./order-generator/order-generator.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OrderGeneratorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'orderGenerator';
}
