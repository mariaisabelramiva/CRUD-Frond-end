import { Routes } from '@angular/router';
import { Inicio } from './Pages/inicio/inicio';
import { EmpleadoComponent } from './Pages/empleado/empleado';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'orden-compra', component: Inicio },
  { path: 'empleado/:idEmpleado', component: EmpleadoComponent },
];
