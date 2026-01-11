import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { DatabaseService, Usuario } from '../services/database.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class LoginPage {
  email = '';
  password = '';
  passwordVisible = false;
  cargando = false;

  // Mensaje visible bajo el formulario
  mensaje = '';

  // Toast declarativo
  toastAbierto = false;
  toastMensaje = '';

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  // Validación de correo
  private esEmailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private mostrarToast(msg: string) {
    this.toastMensaje = msg;
    this.toastAbierto = true;
  }

  async iniciarSesion() {
    if (this.cargando) return;

    // Limpiamos mensajes anteriores
    this.mensaje = '';

    const emailTrim = this.email.trim();
    const passTrim = this.password.trim();

    // 1) Validar campos vacíos
    if (!emailTrim || !passTrim) {
      this.mensaje = 'Debes ingresar correo y contraseña.';
      this.mostrarToast('Faltan datos');
      return;
    }

    // 2) Validar formato de correo
    if (!this.esEmailValido(emailTrim)) {
      this.mensaje = 'El correo no tiene un formato válido (ej: usuario@dominio.com).';
      this.mostrarToast('Correo inválido');
      return;
    }

    // 3) Activar estado de carga
    this.cargando = true;
    await new Promise((r) => setTimeout(r, 50));

    try {
      // 4) Inicializar base de datos
      await this.dbService.init();

      // 5) Buscar usuario
      const usuario: Usuario | null = await this.dbService.login(emailTrim, passTrim);

      // 6) Si no existe, mostrar mensaje
      if (!usuario) {
        this.cargando = false;
        this.mensaje = 'El correo o la contraseña no corresponden a un usuario registrado.';
        this.mostrarToast('Credenciales inválidas');
        return;
      }

      // 7) Guardar sesión
      await this.authService.iniciarSesion({
        id: usuario.usuario_id,
        email: usuario.email,
        nombre: usuario.nombre

      });

      // 8) Navegar a Home
      this.cargando = false;
      this.router.navigateByUrl('/home', { replaceUrl: true });

    } catch (error) {
      this.cargando = false;
      this.mensaje = 'Ocurrió un problema al iniciar sesión. Intenta nuevamente.';
      this.mostrarToast('Error');
    }
  }

  irARegistro() {
    this.router.navigateByUrl('/registro');
  }
}
