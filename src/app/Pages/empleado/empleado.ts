import { Component,inject,input,OnInit} from '@angular/core';

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {FormBuilder,FormGroup,FormsModule} from '@angular/forms';


@Component({
  selector: 'app-empleado',
  imports: [MatInputModule,MatFormFieldModule,MatButtonModule,FormsModule],
  templateUrl: './empleado.html',
  styleUrl: './empleado.css',
})
export class Empleado implements OnInit{
@input('id')= idEmpleado!.number;
private empleadoServicio= inject(EmpleadoService);
public formBuild= inject(FormBuilder);


public formEmpleado:Formgroup=this.formBuild.group({
  idEmpleado:[0],
  nombreCompleto:[''],
  Correo:[''],
  sueldo:[0],
  fechaContrato:['']
});
constructor(private router:Router){}

ngOnlnit():void{
  if(this.idEmpleado !=0){
    this.empleadoServicio.obtener(this.idEmpleado).subscribe({
      next:(data)=>{
       this.formEmpleado.patchValue({

       })
      },
     
    })
}
}
