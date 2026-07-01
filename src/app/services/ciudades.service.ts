//aca se realizan las solicitudes http para las APIs y la conexión
//comunicarse con la API


import { Injectable, inject } from '@angular/core';
import { appsettings } from '../Settings/appsettings';
import { Ciudad } from '../Models/Ciudad';
import { ResponseAPI } from '../Models/ResponseAPI';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CiudadesService {
  private http = inject(HttpClient);
  private apiUrl: string = appsettings.apiUrl + 'Ciudad';

  constructor() {}

  // metodos-Solicitudes
  lista(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(this.apiUrl);
  }

  obtener(id: number): Observable<Ciudad> {
    return this.http.get<Ciudad>(`${this.apiUrl}/${id}`); //se utilizan comillas invertidas para concatenar la url con el id de una forma mas facil
  }

  crear(objeto: Ciudad): Observable<ResponseAPI> {
    return this.http.post<ResponseAPI>(this.apiUrl, objeto);
  }

  editar(objeto: Ciudad): Observable<ResponseAPI> {
    return this.http.put<ResponseAPI>(`${this.apiUrl}/${objeto.idCiudad}`, objeto);
  }

  eliminar(id: number): Observable<ResponseAPI> {
    return this.http.delete<ResponseAPI>(`${this.apiUrl}/${id}`);
  }

}
