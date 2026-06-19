import { Component, ChangeDetectionStrategy, inject, Input, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../Models/Empleado';
import { Router } from '@angular/router';
import { ResponseAPI } from '../../Models/ResponseAPI';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './ciudades.html',
  styleUrls: ['./ciudades.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ciudadcomponent implements OnInit {
  private _idEmpleado = 0;

  @Input()
  set idEmpleado(value: string | number) {
    this._idEmpleado = Number(value) || 0;
  }

  get idEmpleado(): number {
    return this._idEmpleado;
  }

  private empleadoServicio = inject(EmpleadoService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  // formulario empleado

  public formEmpleado: FormGroup = this.formBuilder.group({
    idEmpleado: [0],
    nombreCompleto: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    sueldo: [0, Validators.required],
    fechaContrato: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.idEmpleado > 0) {
      this.empleadoServicio.obtener(this.idEmpleado).subscribe({
        next: (data) => {
          const correoValue = data?.correo || '';
          const fechaFormato = this.parseBackendDateToISO(data?.fechaContrato);
          this.formEmpleado.patchValue({
            idEmpleado: Number(data.idEmpleado) || 0,
            nombreCompleto: data.nombreCompleto,
            correo: correoValue,
            sueldo: data.sueldo,
            fechaContrato: fechaFormato,
          });
        },
        error: (err) => {
          console.error('Error al obtener empleado:', err);
        },
      });
    } 
  }

  private parseBackendDateToISO(fecha: string | Date | undefined): string {
    if (!fecha) return '';
    if (fecha instanceof Date) {
      const y = fecha.getFullYear();
      const m = String(fecha.getMonth() + 1).padStart(2, '0');
      const d = String(fecha.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    const s = String(fecha).trim();
    // dd/MM/yyyy -> yyyy-MM-dd
    const ddmmyyyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const day = ddmmyyyy[1].padStart(2, '0');
      const month = ddmmyyyy[2].padStart(2, '0');
      const year = ddmmyyyy[3];
      return `${year}-${month}-${day}`;
    }

    // already yyyy-MM-dd
    const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) return s;

    // fallback: try Date parse
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    return '';
  }

  private formatDateToBackend(dateStr: string | undefined): string {
    if (!dateStr) return '01/01/1900';
    const s = String(dateStr).trim();
    const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) {
      return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
    }
    // if already dd/MM/yyyy
    const ddmmyyyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const day = ddmmyyyy[1].padStart(2, '0');
      const month = ddmmyyyy[2].padStart(2, '0');
      const year = ddmmyyyy[3];
      return `${day}/${month}/${year}`;
    }
    return '01/01/1900';
  }

  guardar() {
    const fechaParaBackend = this.formatDateToBackend(this.formEmpleado.value.fechaContrato);

    const payload: Empleado = {
      idEmpleado: Number(this.idEmpleado) || 0,
      nombreCompleto: this.formEmpleado.value.nombreCompleto,
      correo: this.formEmpleado.value.correo || '',
      sueldo: Number(this.formEmpleado.value.sueldo) || 0,
      fechaContrato: fechaParaBackend,
    };

    console.log(
      'Guardando empleado (payload):',
      payload,
      'idEmpleado en componente:',
      this.idEmpleado,
    );

    const request$ =
      this.idEmpleado === 0
        ? this.empleadoServicio.crear(payload)
        : this.empleadoServicio.editar(payload);

    request$.subscribe({
      next: (data) => {
        console.log('Respuesta del servidor:', data);
        const success =
          data && typeof (data as ResponseAPI).isSuccess === 'boolean'
            ? (data as ResponseAPI).isSuccess
            : true;

        //Alertas de exito
        if (success) {
          if (this.idEmpleado === 0) {
            Swal.fire({
              icon: 'success',
              title: 'Empleado creado',
              text: 'El empleado fue registrado correctamente',
            }).then(() => {
              this.router.navigate(['/']);
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Actualización exitosa',
              text: 'Los datos se actualizaron correctamente',
            }).then(() => {
              this.router.navigate(['/']);
            });
          }
        }
      },
      error: (err) => {
        console.error('Error completo:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Error:', err.error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el empleado',
        });
      },
    });
  }
  volver(): void {
    this.router.navigate(['/']);
  }
}
