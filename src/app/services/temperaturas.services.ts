import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TemperaturaService {

  constructor(private http: HttpClient) {
  }

  getTemperaturas(): Observable<any> {
    return this.http.get<any>('http://roundhouse.proxy.rlwy.net:27151/');
  }
}