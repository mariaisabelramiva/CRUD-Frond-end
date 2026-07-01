import { Component, ChangeDetectionStrategy, inject, Input, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ResponseAPI } from '../../Models/ResponseAPI';
import Swal from 'sweetalert2';
import { Ciudad } from '../../Models/Ciudad';
import { CiudadesService } from '../../services/ciudades.service';

@Component({
  selector: 'app-ciudad',
  standalone: true,
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './ciudad.html',
  styleUrls: ['./ciudad.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CiudadComponent implements OnInit {
  private _idCiudad = 0;

  @Input()
  set idCiudad(value: string | number) {
    this._idCiudad = Number(value) || 0;
  }

  get idCiudad(): number {
    return this._idCiudad;
  }

  private CiudadServicio = inject(CiudadesService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  public guardando = false;

  // formulario ciudad

  public formCiudad: FormGroup = this.formBuilder.group({
    idCiudad: [0],
    Ciudad: ['', Validators.required],
    Departamento: ['', [Validators.required]],
    Horario: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.idCiudad > 0) {
      this.CiudadServicio.obtener(this.idCiudad).subscribe({
        next: (data: Ciudad) => {
          const Horario = this.parseBackendDateToISO(data?.horario);
          this.formCiudad.patchValue({
            idCiudad: Number(data.idCiudad) || 0,
            Ciudad: data.ciudad,
            Departamento: data.departamento,
            Horario,
          });
        },
        error: (err: unknown) => {
          console.error('Error al obtener ciudad:', err);
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

  guardarCiudad() {
    if (this.formCiudad.invalid) {
      this.formCiudad.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Completa los campos',
        text: 'Debes llenar todos los datos obligatorios antes de guardar.',
      });
      return;
    }

    this.guardando = true;
    const valores = this.formCiudad.getRawValue();
    const fechaParaBackend = this.formatDateToBackend(valores.Horario);

    const payload: Ciudad = {
      idCiudad: Number(valores.idCiudad) || 0,
      ciudad: String(valores.Ciudad ?? '').trim(),
      departamento: String(valores.Departamento ?? '').trim(),
      horario: fechaParaBackend,
    };

    console.log('Guardando ciudad (payload):', payload);

    const request$ =
      this.idCiudad === 0
        ? this.CiudadServicio.crear(payload)
        : this.CiudadServicio.editar(payload);

    request$.subscribe({
      next: (data: ResponseAPI) => {
        this.guardando = false;
        console.log('Respuesta del servidor:', data);
        const success =
          data && typeof (data as ResponseAPI).isSuccess === 'boolean'
            ? (data as ResponseAPI).isSuccess
            : true;

        if (success) {
          const titulo = this.idCiudad === 0 ? 'Ciudad creada' : 'Actualización exitosa';
          const texto = this.idCiudad === 0
            ? 'La ciudad fue registrada correctamente'
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
      error: (err: { status: boolean; message: string; error: string; }) => {
        this.guardando = false;
        console.error('Error completo:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la ciudad. Revisa la conexión o los datos enviados.',
        });
      },
    });
  }
  volver(): void {
    this.router.navigate(['/']);
  }
}
