import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('./login/login.page').then(m => m.LoginPage) },
  { path: 'registro', loadComponent: () => import('./registro/registro.page').then(m => m.RegistroPage) },

  { path: 'home', canActivate: [AuthGuard], loadComponent: () => import('./home/home.page').then(m => m.HomePage) },

  // ✅ Clima (Open-Meteo)
  { path: 'clima', canActivate: [AuthGuard], loadComponent: () => import('./clima/clima.page').then(m => m.ClimaPage) },

  // Foro
  { path: 'foro', loadComponent: () => import('./foro/foro.page').then(m => m.ForoPage) },

  // Agregar tema
  { path: 'agregartema', loadComponent: () => import('./agregartema/agregartema.page').then(m => m.AgregartemaPage) },

  // Tema foro
  {
    path: 'temaforo/:id',
    // canActivate: [AuthGuard], // opcional (si quieres que solo logeados comenten/ver)
    loadComponent: () => import('./temaforo/temaforo.page').then(m => m.TemaforoPage),
  },

  // Agregar imagen
  {
    path: 'agregarimagen',
    canActivate: [AuthGuard],
    loadComponent: () => import('./agregarimagen/agregarimagen.page').then(m => m.AgregarimagenPage),
  },

  // Chat
  {
    path: 'chat',
    canActivate: [AuthGuard],
    loadComponent: () => import('./chat/chat.page').then(m => m.ChatPage),
  },

  // Wildcard
  { path: '**', redirectTo: 'login' },
];
