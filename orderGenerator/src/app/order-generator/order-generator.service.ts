import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Order } from '../_models/order';

@Injectable({
  providedIn: 'root',
})
export class OrderGeneratorService {
  private baseUrl = 'https://localhost:5001/api/OrderAccumulator';

  constructor(private http: HttpClient) {}

  enviar(order: Order): Observable<any> {
    console.log('POSTEI');
    return this.http.post<any>(this.baseUrl, order);
  }
}
