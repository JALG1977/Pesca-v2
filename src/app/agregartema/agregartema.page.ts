import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, IonicModule } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agregartema',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './agregartema.page.html',
  styleUrls: ['./agregartema.page.scss'],
})
export class AgregartemaPage {
  titulo = '';
  descripcion = '';

  usuarioId: number | null = null;
  nombreUsuario = '';

  guardando = false;

  private log(msg: string, extra?: any) {
    console.log(`[agregartema] ${msg}`, extra ?? '');
  }

  constructor(
    private db: DatabaseService,
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async ionViewWillEnter() {
    const user = await this.auth.getUsuarioActual();
    this.usuarioId = user?.usuario_id ?? null;
    this.nombreUsuario = user?.nombre ?? '';
    this.log('sesion:', user);
  }

  async guardarTema() {
    if (this.guardando) return;

    const t = this.titulo.trim();
    const d = this.descripcion.trim();

    if (!t || !d) {
      this.mostrarToastNoBloqueante('Completa título y descripción.');
      return;
    }

    if (!this.usuarioId || !this.nombreUsuario) {
      this.mostrarToastNoBloqueante('No se pudo obtener el usuario logeado.');
      return;
    }

    this.guardando = true;

    try {
      this.log('antes insertar tema');

      await this.db.foroCrearTema(this.usuarioId, t, d, this.nombreUsuario);

      this.log('después insertar tema');

      
      this.mostrarToastNoBloqueante('Tema creado');

      
      await this.router.navigateByUrl('/foro', { replaceUrl: true });

    } catch (e) {
      console.error('Error al crear tema:', e);
      this.mostrarToastNoBloqueante('No se pudo crear el tema.');
    } finally {
      this.guardando = false;
    }
  }

  
  private mostrarToastNoBloqueante(message: string) {
    try {
      this.toastCtrl
        .create({
          message,
          duration: 1500,
          position: 'bottom',
        })
        .then(t => t.present())
        .catch(err => console.error('[agregartema] toast error:', err));
    } catch (err) {
      console.error('[agregartema] toast error (try/catch):', err);
    }
  }
}
