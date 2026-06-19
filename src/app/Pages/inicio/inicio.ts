import { Component , inject, ChangeDetectionStrategy, ChangeDetectorRef, Inject} from '@angular/core';
import {EmpleadoService} from '../../services/empleado.service';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Empleado } from '../../Models/Empleado';
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
  private empleadoServicio= inject(EmpleadoService);
  private cdr = inject(ChangeDetectorRef);
  public listaEmpleados:Empleado[]=[];
  public displayedColumns: string[]= ['nombreCompleto','correo', 'sueldo','fechaContrato', 'acción'];


  ngOnInit(){
    this.obtenerEmpleados();
  }

  obtenerEmpleados(){
    this.empleadoServicio.lista().subscribe({
      next:(data)=>{
    if (Array.isArray(data) && data.length > 0) {
      // Normalizar propiedades recibidas desde el backend ("correo" vs "Correo")
      this.listaEmpleados = data.map((item: Empleado) => ({
        idEmpleado: item.idEmpleado,
        nombreCompleto: item.nombreCompleto,
        correo: item.correo || item.correo || '',
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
