import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Httpcalls {
  private API = 'https://api.vallauristore.it/api';

  constructor(private httpClient: HttpClient) {}

  Post(endPoint: string, data: any): Observable<any> {
    return this.httpClient.post<any>(this.API + endPoint, data, {
      withCredentials: true,
    });
  }

  Get(endPoint: string): Observable<any> {
    return this.httpClient.get<any>(this.API + endPoint, {
      withCredentials: true,
    });
  }

  // Per upload multipart/form-data (immagini).
  // NON impostare Content-Type manualmente: il browser lo aggiunge
  // automaticamente con il boundary corretto quando il body è un FormData.
  PostFormData(endPoint: string, formData: FormData): Observable<any> {
    return this.httpClient.post<any>(this.API + endPoint, formData, {
      withCredentials: true,
    });
  }
}