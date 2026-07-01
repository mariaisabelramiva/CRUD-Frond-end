import { Component, ChangeDetectionStrategy, inject, Input, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpleadoService } from '../../services/empleado.service';
import { CiudadesService } from '../../services/ciudades.service';
import { Empleado } from '../../Models/Empleado';
import { Ciudad } from '../../Models/Ciudad';
import { Router } from '@angular/router';
import { ResponseAPI } from '../../Models/ResponseAPI';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './empleado.html',
  styleUrls: ['./empleado.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpleadoComponent implements OnInit {
  private _idEmpleado = 0;



  @Input()
  set idEmpleado(value: string | number) {
    this._idEmpleado = Number(value) || 0;
  }

  get idEmpleado(): number {
    return this._idEmpleado;
  }

  private empleadoServicio = inject(EmpleadoService);
  private ciudadServicio = inject(CiudadesService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  public listaCiudades: Ciudad[] = [];
  public guardando = false;

  // formulario empleado

  public formEmpleado: FormGroup = this.formBuilder.group({
    idEmpleado: [0],
    idCiudad: [0, [Validators.required, Validators.min(1)]],
    nombreCompleto: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    sueldo: [0, Validators.required],
    fechaContrato: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cargarCiudades();

    if (this.idEmpleado > 0) {
      this.empleadoServicio.obtener(this.idEmpleado).subscribe({
        next: (data) => {
          const correoValue = data?.correo || '';
          const fechaFormato = this.parseBackendDateToISO(data?.fechaContrato);
          this.formEmpleado.patchValue({
            idEmpleado: Number(data.idEmpleado) || 0,
            idCiudad: Number(data.idCiudad) || 0,
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

  private cargarCiudades(): void {
    this.ciudadServicio.lista().subscribe({
      next: (data) => {
        this.listaCiudades = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error al cargar ciudades:', err);
      },
    });
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
    if (this.formEmpleado.invalid) {
      this.formEmpleado.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Completa los campos',
        text: 'Debes llenar todos los datos obligatorios antes de guardar.',
      });
      return;
    }

    this.guardando = true;
    const valores = this.formEmpleado.getRawValue();
    const fechaParaBackend = this.formatDateToBackend(valores.fechaContrato);

    const payload: Empleado = {
      idEmpleado: Number(valores.idEmpleado) || 0,
      idCiudad: Number(valores.idCiudad) || 0,
      nombreCompleto: String(valores.nombreCompleto ?? '').trim(),
      correo: String(valores.correo ?? '').trim(),
      sueldo: Number(valores.sueldo) || 0,
      fechaContrato: fechaParaBackend,
    };

    console.log('Guardando empleado (payload):', payload);

    const request$ =
      this.idEmpleado === 0
        ? this.empleadoServicio.crear(payload)
        : this.empleadoServicio.editar(payload);

    request$.subscribe({
      next: (data) => {
        this.guardando = false;
        console.log('Respuesta del servidor:', data);
        const success =
          data && typeof (data as ResponseAPI).isSuccess === 'boolean'
            ? (data as ResponseAPI).isSuccess
            : true;

        if (success) {
          const titulo = this.idEmpleado === 0 ? 'Empleado creado' : 'Actualización exitosa';
          const texto = this.idEmpleado === 0
            ? 'El empleado fue registrado correctamente'
            : 'Los datos se actualizaron correctamente';

          Swal.fire({
            icon: 'success',
            title: titulo,
            text: texto,
          }).then(() => {
            this.router.navigate(['/']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo guardar',
            text: 'El servidor rechazó la solicitud.',
          });
        }
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error completo:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el empleado. Revisa la conexión o los datos enviados.',
        });
      },
    });
  }
  volver(): void {
    this.router.navigate(['/']);
  }
}
