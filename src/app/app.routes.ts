import { Routes } from '@angular/router';
import { Inicio } from './Pages/inicio/inicio';
import { Empleado } from './Pages/empleado/empleado';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'orden-compra', component: Inicio },
  { path: 'empleado/:id', component: Empleado },
];
