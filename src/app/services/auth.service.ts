import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const CURRENT_USER_KEY = 'current_user';

export interface UsuarioSesion {
  id: number;
  email: string;
  usuario_id?: number;
  nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarioActual: UsuarioSesion | null = null;

  constructor(private router: Router) {
    // Intento de cargar sesión al iniciar el servicio
    this.cargarSesionDesdeStorage();
  }

  // --- Manejo de almacenamiento en localStorage ---

  private normalizarSesion(u: UsuarioSesion): UsuarioSesion {
    // Garantiza que usuario_id siempre exista, sin romper lo anterior
    return {
      ...u,
      usuario_id: u.usuario_id ?? u.id,
    };
  }

  private cargarSesionDesdeStorage(): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UsuarioSesion;
        this.usuarioActual = this.normalizarSesion(parsed);
      }
    } catch (e) {
      console.error('Error al leer sesión desde localStorage', e);
    }
  }

  private guardarSesionEnStorage(): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      if (this.usuarioActual) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.usuarioActual));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Error al guardar sesión en localStorage', e);
    }
  }

  // --- API pública usada por login, guard, etc. ---

  async iniciarSesion(usuario: UsuarioSesion): Promise<void> {
    this.usuarioActual = this.normalizarSesion(usuario);
    this.guardarSesionEnStorage();
  }

  async cerrarSesion(): Promise<void> {
    this.usuarioActual = null;
    this.guardarSesionEnStorage();
    this.router.navigate(['/login']);
  }


  getUsuarioActualSincrono(): UsuarioSesion | null {
    return this.usuarioActual;
  }

  async getUsuarioActual(): Promise<UsuarioSesion | null> {
    if (!this.usuarioActual) {
      this.cargarSesionDesdeStorage();
    }
    return this.usuarioActual;
  }

  async estaAutenticado(): Promise<boolean> {
    const user = await this.getUsuarioActual();
    return !!user;
  }


  getUsuarioActualSync(): UsuarioSesion | null {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as UsuarioSesion;
      return this.normalizarSesion(parsed);
    } catch {
      return null;
    }
  }
}
