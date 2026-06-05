import { Component , inject, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {EmpleadoService} from '../../services/empleado.service';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Empleado } from '../../Models/Empleado';
import { Router } from '@angular/router';

const ELEMENT_DATA: Empleado[] = [
  {idEmpleado: 1, nombreCompleto: "Santiago", Correo: 'Hydrogen', sueldo: 1.0079, fechaContrato: "2020-01-01"},
  {idEmpleado: 2, nombreCompleto: "María", Correo: 'Helium', sueldo: 4.0026, fechaContrato: "2020-01-02"},
  {idEmpleado: 3, nombreCompleto: "Juan", Correo: 'Lithium', sueldo: 6.941, fechaContrato: "2020-01-03"},
  {idEmpleado: 4, nombreCompleto: "Ana", Correo: 'Beryllium', sueldo: 9.0122, fechaContrato: "2020-01-04"},
  {idEmpleado: 5, nombreCompleto: "Carlos", Correo: 'Boron', sueldo: 10.811, fechaContrato: "2020-01-05"},
  {idEmpleado: 6, nombreCompleto: "Laura", Correo: 'Carbon', sueldo: 12.0107, fechaContrato: "2020-01-06"},
  {idEmpleado: 7, nombreCompleto: "Pedro", Correo: 'Nitrogen', sueldo: 14.0067, fechaContrato: "2020-01-07"},
  {idEmpleado: 8, nombreCompleto: "Sofía", Correo: 'Oxygen', sueldo: 15.9994, fechaContrato: "2020-01-08"},
  {idEmpleado: 9, nombreCompleto: "Diego", Correo: 'Fluorine', sueldo: 18.9984, fechaContrato: "2020-01-09"},
  {idEmpleado: 10, nombreCompleto: "Valeria", Correo: 'Neon', sueldo: 20.1797, fechaContrato: "2020-01-10"},
];


@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Inicio {
   constructor (private  router:Router){}

  //se recibe la lista de empleados y toca visualizarla en el html mediante un tabla 
  private empleadoServicio= inject(EmpleadoService);
  private cdr = inject(ChangeDetectorRef);
  public listaEmpleados:Empleado[]=[];
  public displayedColumns: string[]= ['nombreCompleto','Correo', 'sueldo','fechaContrato', 'acción'];

  dataSource = ELEMENT_DATA;

  ngOnInit(){
    this.obtenerEmpleados();
  }

  obtenerEmpleados(){
    this.empleadoServicio.lista().subscribe({
      next:(data: any)=>{
    if (Array.isArray(data) && data.length > 0) {
      // Normalizar propiedades recibidas desde el backend ("correo" vs "Correo")
      this.listaEmpleados = data.map((item: any) => ({
        idEmpleado: item.idEmpleado,
        nombreCompleto: item.nombreCompleto,
        Correo: item.Correo || item.correo || '',
        sueldo: item.sueldo,
        fechaContrato: item.fechaContrato
      }));
      this.cdr.markForCheck();
    } else {
      alert("no se encontraron empleados");
    }
  },
error:(err)=>{  
   console.log(err.message)
      }
    })
  }
 

   
  nuevo(){
    this.router.navigate(['/empleado',0]); 
  }

  editar(objeto:Empleado){
    this.router.navigate(['/empleado',objeto.idEmpleado]); 
  }

  eliminar(idEmpleado:number){
if(confirm("¿Desea eliminar el empleado?")){
this.empleadoServicio.eliminar(idEmpleado).subscribe(
  data => {
    if (data.isSuccess) {
      this.obtenerEmpleados();
    } else {
      alert("no se pudo eliminar");
    }
  },
  err => {
    console.log(err.message);
  }
);

  }
}
}
