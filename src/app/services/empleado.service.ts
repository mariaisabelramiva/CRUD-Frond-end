//aca se realizan las solicitudes http para las APIs y la conexión
//comunicarse con la API

import { HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appsettings } from '../Settings/appsettings';
import { Empleado } from '../Models/Empleado';
import {ResponseAPI} from '../Models/ResponseAPI';


@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private http = inject(HttpClient);
  private apiUrl:string= appsettings.apiUrl +"Empleado";

  constructor(){}


  // metodos-Solicitudes 
lista(){
return this.http.get<Empleado[]>(this.apiUrl);
}

obtener (id:number){
return this.http.get<Empleado>(`${this.apiUrl}/${id}` );//se utilizan comillas invertidas para concatenar la url con el id de una forma mas facil 
}

crear(objeto: any) {
  return this.http.post<ResponseAPI>(this.apiUrl, objeto);
}

editar(objeto: any) {
  return this.http.put<ResponseAPI>(`${this.apiUrl}/${objeto.idEmpleado}`, objeto);
}


eliminar(id:number){
  return this.http.delete<ResponseAPI>(`${this.apiUrl}/${id}`);
 }
}


