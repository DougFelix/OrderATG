import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Order } from '../_models/order';
import { Result } from '../_models/response';

@Injectable({
  providedIn: 'root',
})
export class OrderGeneratorService {
  private baseUrl = 'https://localhost:5001/api/OrderAccumulator';

  constructor(private http: HttpClient) {}

  enviar(order: Order): Observable<Result> {
    return this.http.post<Result>(this.baseUrl, order);
  }

  resetar(): Observable<any> {
    return this.http.delete(this.baseUrl);
  }

  getOrders(): Observable<Order> {
    return this.http.get<Order>(this.baseUrl);
  }

  getExposicaoFinanceira(ativo: string): Observable<number> {
    return this.http.get<number>(this.baseUrl + `/${ativo}`);
  }
}
