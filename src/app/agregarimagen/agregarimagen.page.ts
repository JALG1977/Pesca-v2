import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CapturasService } from '../services/capturas.service';
import { AuthService } from '../services/auth.service';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-agregarimagen',
  templateUrl: './agregarimagen.page.html',
  styleUrls: ['./agregarimagen.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class AgregarimagenPage {
  titulo = '';
  descripcion = '';
  imagenBase64: string | null = null;
  cargando = false;

  // Mensaje visible bajo el formulario 
  mensaje = '';

  // Toast 
  toastAbierto = false;
  toastMensaje = '';

  constructor(
    private capturasService: CapturasService,
    private authService: AuthService,
    private navCtrl: NavController
  ) {}

  private mostrarToast(msg: string) {
    this.toastMensaje = msg;
    this.toastAbierto = true;
  }

  volverHome() {
    this.navCtrl.navigateRoot('/home');
  }

  private async cargarDesdeCamara(source: CameraSource) {
    // limpiamos mensajes anteriores
    this.mensaje = '';

    try {
      const photo = await Camera.getPhoto({
        quality: 75,
        allowEditing: false,
        source,
        resultType: CameraResultType.Base64,
      });

      if (!photo.base64String) {
        this.mensaje = 'No se pudo cargar la imagen. Intenta nuevamente.';
        this.mostrarToast('No se cargó la imagen');
        return;
      }

      const format = photo.format || 'jpeg';
      this.imagenBase64 = `data:image/${format};base64,${photo.base64String}`;
      this.mostrarToast('Imagen seleccionada');
    } catch (err: any) {
      // Si el usuario cancela, no hacemos escándalo
      const msg = err?.message || String(err);

      // cuando se cancela, a veces el mensaje viene vacío o genérico
      if (msg && msg.toLowerCase().includes('cancel')) {
        return;
      }
    }
  }

  async tomarFoto() {
    await this.cargarDesdeCamara(CameraSource.Camera);
  }

  async elegirDeGaleria() {
    await this.cargarDesdeCamara(CameraSource.Photos);
  }

  async guardar() {
    if (this.cargando) return;

    // limpiamos mensajes anteriores
    this.mensaje = '';

    const tituloTrim = this.titulo.trim();

    // Validaciones 
    if (!tituloTrim) {
      this.mensaje = 'Debes ingresar un título.';
      this.mostrarToast('Falta título');
      return;
    }

    if (!this.imagenBase64) {
      this.mensaje = 'Debes tomar una foto o elegir una imagen.';
      this.mostrarToast('Falta imagen');
      return;
    }

    this.cargando = true;
    await new Promise((r) => setTimeout(r, 50)); 

    try {
      const usuario = await this.authService.getUsuarioActual();

      if (!usuario) {
        this.cargando = false;
        this.mensaje = 'Tu sesión no es válida. Vuelve a iniciar sesión.';
        this.mostrarToast('Sesión no válida');
        this.navCtrl.navigateRoot('/login');
        return;
      }

      await this.capturasService.agregarCapturaDesdeDataUrl({
        usuarioId: usuario.id,
        titulo: tituloTrim,
        descripcion: this.descripcion.trim(),
        dataUrl: this.imagenBase64,
      });

      // limpiar formulario
      this.titulo = '';
      this.descripcion = '';
      this.imagenBase64 = null;

      this.cargando = false;
      this.mostrarToast('Captura guardada ');

      // navegar a home
      setTimeout(() => {
        this.navCtrl.navigateRoot('/home');
      }, 150);

    } catch (error) {
      this.cargando = false;
      this.mensaje = 'No se pudo guardar la captura. Intenta nuevamente.';
      this.mostrarToast('Error al guardar');
    }
  }
}
