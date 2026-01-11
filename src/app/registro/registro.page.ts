import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RegistroPage {
  nombreCompleto = '';
  email = '';
  password = '';
  confirmarPassword = '';

  cargando = false;

  // Mensajes visibles en pantalla
  mensaje = '';

  // Toast 
  toastAbierto = false;
  toastMensaje = '';

  constructor(private db: DatabaseService, private navCtrl: NavController) {}

  // Validación de correo 
  private esEmailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private mostrarToast(msg: string) {
    this.toastMensaje = msg;
    this.toastAbierto = true;
  }

  async registrar() {
    if (this.cargando) return;

    // limpio mensajes anteriores
    this.mensaje = '';

    const nombre = this.nombreCompleto.trim();
    const correo = this.email.trim();

    // Validaciones 
    if (!nombre || !correo || !this.password || !this.confirmarPassword) {
      this.mensaje = 'Completa todos los campos.';
      this.mostrarToast(this.mensaje);
      return;
    }

    if (!this.esEmailValido(correo)) {
      this.mensaje = 'El correo no tiene formato válido (ej: usuario@dominio.com).';
      this.mostrarToast('Correo inválido');
      return;
    }

    if (this.password.length < 4) {
      this.mensaje = 'La contraseña debe tener al menos 4 caracteres.';
      this.mostrarToast('Contraseña muy corta');
      return;
    }

    if (this.password !== this.confirmarPassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      this.mostrarToast('Revisa tu contraseña');
      return;
    }

    // Activo el cargando 
    this.cargando = true;
    await new Promise((r) => setTimeout(r, 50));

    try {
      // Me aseguro de que la BD esté lista
      await this.db.init();

      // Registro el usuario
      await this.db.registrarUsuario(nombre, correo, this.password);

      this.cargando = false;
      this.mostrarToast('Registro exitoso ✅');

      
      setTimeout(() => {
        this.navCtrl.navigateRoot('/login');
      }, 200);

    } catch (error: any) {
      this.cargando = false;

      const msg =
        typeof error?.message === 'string'
          ? error.message
          : 'No se pudo registrar. Intenta nuevamente.';

      this.mensaje = msg;
      this.mostrarToast('Error al registrar');
    }
  }

  irALogin() {
    this.navCtrl.navigateRoot('/login');
  }
}
