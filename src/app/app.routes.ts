import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { installGuard } from './core/install/guards/install.guard';
import { installedGuard } from './core/install/guards/installed.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/root/root-redirect.component').then(
        (m) => m.RootRedirectComponent
      ),
  },
  {
    path: 'install',
    canActivate: [installGuard],
    loadComponent: () =>
      import('./features/install/install/install.component').then(
        (m) => m.InstallComponent
      ),
  },
  {
    path: 'login',
    canActivate: [installedGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [installedGuard, authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/perfil/perfil.component').then(
            (m) => m.PerfilComponent
          ),
      },
      {
        path: 'ph',
        loadComponent: () =>
          import('./features/ph/ph/ph.component').then((m) => m.PhComponent),
      },
      {
        path: 'zonas-comunes/nuevo',
        loadComponent: () =>
          import('./features/zonas-comunes/zona-comun-form/zona-comun-form.component').then(
            (m) => m.ZonaComunFormComponent
          ),
      },
      {
        path: 'zonas-comunes/:id/editar',
        loadComponent: () =>
          import('./features/zonas-comunes/zona-comun-form/zona-comun-form.component').then(
            (m) => m.ZonaComunFormComponent
          ),
      },
      {
        path: 'zonas-comunes',
        loadComponent: () =>
          import('./features/zonas-comunes/zona-comun-list/zona-comun-list.component').then(
            (m) => m.ZonaComunListComponent
          ),
      },
      {
        path: 'inmuebles/carga-masiva',
        loadComponent: () =>
          import('./features/inmuebles/carga-masiva/carga-masiva.component').then(
            (m) => m.CargaMasivaComponent
          ),
      },
      {
        path: 'inmuebles/nuevo',
        loadComponent: () =>
          import('./features/inmuebles/inmueble-form/inmueble-form.component').then(
            (m) => m.InmuebleFormComponent
          ),
      },
      {
        path: 'inmuebles/:id/editar',
        loadComponent: () =>
          import('./features/inmuebles/inmueble-form/inmueble-form.component').then(
            (m) => m.InmuebleFormComponent
          ),
      },
      {
        path: 'inmuebles',
        loadComponent: () =>
          import('./features/inmuebles/inmueble-list/inmueble-list.component').then(
            (m) => m.InmuebleListComponent
          ),
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () =>
          import('./features/usuarios/user-form/user-form.component').then(
            (m) => m.UserFormComponent
          ),
      },
      {
        path: 'usuarios/:id/editar',
        loadComponent: () =>
          import('./features/usuarios/user-form/user-form.component').then(
            (m) => m.UserFormComponent
          ),
      },
      {
        path: 'usuarios/:id',
        loadComponent: () =>
          import('./features/usuarios/user-detail/user-detail.component').then(
            (m) => m.UserDetailComponent
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/user-list/user-list.component').then(
            (m) => m.UserListComponent
          ),
      },
      {
        path: 'reuniones/nueva',
        loadComponent: () =>
          import('./features/reuniones/reunion-form/reunion-form.component').then(
            (m) => m.ReunionFormComponent
          ),
      },
      {
        path: 'reuniones/:id/editar',
        loadComponent: () =>
          import('./features/reuniones/reunion-form/reunion-form.component').then(
            (m) => m.ReunionFormComponent
          ),
      },
      {
        path: 'reuniones/:id/estadisticas',
        loadComponent: () =>
          import('./features/reuniones/estadisticas/estadisticas.component').then(
            (m) => m.EstadisticasComponent
          ),
      },
      {
        path: 'reuniones/:id/orden-dia',
        loadComponent: () =>
          import('./features/reuniones/orden-dia/orden-dia.component').then(
            (m) => m.OrdenDiaComponent
          ),
      },
      {
        path: 'reuniones/:id/preguntas/:preguntaId/resultados',
        loadComponent: () =>
          import('./features/preguntas/resultados/resultados-standalone.component').then(
            (m) => m.ResultadosStandaloneComponent
          ),
      },
      {
        path: 'reuniones/:id/preguntas/nueva',
        loadComponent: () =>
          import('./features/preguntas/pregunta-form/pregunta-form.component').then(
            (m) => m.PreguntaFormComponent
          ),
      },
      {
        path: 'reuniones/:id/preguntas/:preguntaId/editar',
        loadComponent: () =>
          import('./features/preguntas/pregunta-form/pregunta-form.component').then(
            (m) => m.PreguntaFormComponent
          ),
      },
      {
        path: 'reuniones/:id/preguntas',
        loadComponent: () =>
          import('./features/preguntas/pregunta-list/pregunta-list.component').then(
            (m) => m.PreguntaListComponent
          ),
      },
      {
        path: 'reuniones/:id/asistentes',
        loadComponent: () =>
          import('./features/asistentes/reunion-asistentes/reunion-asistentes.component').then(
            (m) => m.ReunionAsistentesComponent
          ),
      },
      {
        path: 'reuniones/:id/tardio',
        loadComponent: () =>
          import('./features/asistentes/tardio-asistentes/tardio-asistentes.component').then(
            (m) => m.TardioAsistentesComponent
          ),
      },
      {
        path: 'reuniones/:id/en-vivo',
        loadComponent: () =>
          import('./features/reuniones/en-vivo/en-vivo.component').then(
            (m) => m.EnVivoComponent
          ),
      },
      {
        path: 'reuniones/:id',
        loadComponent: () =>
          import('./features/reuniones/reunion-detail/reunion-detail.component').then(
            (m) => m.ReunionDetailComponent
          ),
      },
      {
        path: 'reuniones',
        loadComponent: () =>
          import('./features/reuniones/reunion-list/reunion-list.component').then(
            (m) => m.ReunionListComponent
          ),
      },
      {
        path: 'asistentes/barcodes',
        loadComponent: () =>
          import('./features/asistentes/barcodes-print/barcodes-print.component').then(
            (m) => m.BarcodesPrintComponent
          ),
      },
      {
        path: 'asistentes/nuevo',
        loadComponent: () =>
          import('./features/asistentes/asistente-form/asistente-form.component').then(
            (m) => m.AsistenteFormComponent
          ),
      },
      {
        path: 'asistentes/:id/editar',
        loadComponent: () =>
          import('./features/asistentes/asistente-form/asistente-form.component').then(
            (m) => m.AsistenteFormComponent
          ),
      },
      {
        path: 'asistentes',
        loadComponent: () =>
          import('./features/asistentes/asistente-list/asistente-list.component').then(
            (m) => m.AsistenteListComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
