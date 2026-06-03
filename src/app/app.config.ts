import { ApplicationConfig, importProvidersFrom} from '@angular/core';
import { provideRouter , withComponentInputBinding } from '@angular/router';


import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),//permitir que dentro de la Url se permitan parametros y se puedan obtener dentro del componente
    provideAnimationsAsync(),

    importProvidersFrom(HttpClientModule)
  ]
};
