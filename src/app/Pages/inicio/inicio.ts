import { Component , inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {EmpleadoService} from '../../services/empleado.service';
import {CiudadesService} from '../../services/ciudades.service';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Empleado } from '../../Models/Empleado';
import {Ciudad} from '../../Models/Ciudad';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';




@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Inicio {
   constructor (  private router: Router){}

  //se recibe la lista de empleados y toca visualizarla en el html mediante un tabla 
  private empleadoServicio = inject(EmpleadoService);
  private ciudadServicio = inject(CiudadesService);
  private cdr = inject(ChangeDetectorRef);
  public listaEmpleados:Empleado[]=[];
  public listaCiudades:Ciudad[]=[];
  public displayedColumns: string[]= ['nombreCompleto','correo', 'sueldo','fechaContrato', 'acción'];
  public displayedColumnsCiudades: string[]= ['departamento','ciudad', 'horario','dias', 'nombreEmpleado', 'acción'];


  







  ngOnInit(){
    this.obtenerEmpleados();
  }

  obtenerEmpleados(){
    this.empleadoServicio.lista().subscribe({
      next:(data: Empleado[])=>{
    if (Array.isArray(data) && data.length > 0) {
      // Normalizar propiedades recibidas desde el backend ("correo" vs "Correo")
      this.listaEmpleados = data.map((item: Empleado) => ({
        idEmpleado: item.idEmpleado,
        idCiudad: item.idCiudad,
        nombreCompleto: item.nombreCompleto,
        correo: item.correo ?? '',
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





// pruebas ciudad
obtenerCiudades(){
    this.ciudadServicio.lista().subscribe({
      next:(data: Ciudad[])=>{
    if (Array.isArray(data) && data.length > 0) {
      this.listaCiudades = data.map((item: Ciudad) => ({
        idCiudad: item.idCiudad,
        departamento: item.departamento,
        ciudad: item.ciudad,
        horario: item.horario,
        nombreEmpleado: item.nombreEmpleado
      }));
      this.cdr.markForCheck();
    } else {
      alert("no se encontraron ciudades");
    }
  },
error:(err: { message: string; })=>{  
   console.log(err.message)
      }
    })
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 







   nuevo(){
    this.router.navigate(['/empleado',0]); 
  }

  nuevoEmpleado(){
    this.router.navigate(['/ciudad',0]);
  }

  editar(objeto:Empleado){
    this.router.navigate(['/empleado',objeto.idEmpleado]); 
  }



  

 eliminar(idEmpleado:number){

  Swal.fire({
    title: '¿Desea eliminar el empleado?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: 'rgb(32, 168, 61)', // Clases de Bootstrap
    cancelButtonColor: 'rgb(206, 64, 64)',


  }).then((result) => {

    if (result.isConfirmed) {

      this.empleadoServicio.eliminar(idEmpleado).subscribe(
        data => {

          if (data.isSuccess) {

            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El empleado fue eliminado correctamente'
            });

            this.obtenerEmpleados();

          } else {

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el empleado'
            });

          }

        },
        err => {
          console.log(err.message);

    
        }
      );

    }

  });

}
}
