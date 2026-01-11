import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DatabaseService, ForoTema, ForoMensaje } from '../services/database.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-temaforo',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './temaforo.page.html',
  styleUrls: ['./temaforo.page.scss'],
})
export class TemaforoPage {
  temaId = 0;
  tema: ForoTema | null = null;
  mensajes: ForoMensaje[] = [];

  comentario = '';
  publicando = false;

  usuarioId: number | null = null;
  nombreUsuario = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService,
    private auth: AuthService,
    private toastCtrl: ToastController
  ) {}

  async ionViewWillEnter() {
    this.temaId = Number(this.route.snapshot.paramMap.get('id') || 0);
    if (!this.temaId) {
      this.router.navigateByUrl('/foro');
      return;
    }

    const user = await this.auth.getUsuarioActual();
    this.usuarioId = user?.usuario_id ?? null;
    this.nombreUsuario = user?.nombre ?? '';

    await this.cargarTodo();
  }

  async cargarTodo(event?: any) {
    try {
      this.tema = await this.db.foroObtenerTemaPorId(this.temaId);
      this.mensajes = await this.db.foroListarMensajesPorTema(this.temaId);
    } catch (e) {
      console.error('[temaforo] error cargar:', e);
      this.toastNoBloqueante('No se pudo cargar el tema.');
    } finally {
      if (event) event.target.complete();
    }
  }

  async publicarComentario() {
    if (this.publicando) return;

    const texto = this.comentario.trim();
    if (!texto) {
      this.toastNoBloqueante('Escribe un comentario.');
      return;
    }
    if (!this.usuarioId) {
      this.toastNoBloqueante('No hay sesión activa.');
      return;
    }

    this.publicando = true;
    try {
      await this.db.foroAgregarMensaje(this.temaId, this.usuarioId, texto);
      this.comentario = '';
      await this.cargarTodo();
      this.toastNoBloqueante('Comentario publicado ✅');
    } catch (e) {
      console.error('[temaforo] error publicar:', e);
      this.toastNoBloqueante('No se pudo publicar.');
    } finally {
      this.publicando = false;
    }
  }

  volver() {
    this.router.navigateByUrl('/foro');
  }

  formatearFecha(ms: number) {
    return new Date(ms).toLocaleString();
  }

  private toastNoBloqueante(message: string) {
    this.toastCtrl
      .create({ message, duration: 1500, position: 'bottom' })
      .then(t => t.present())
      .catch(err => console.error('[temaforo] toast error:', err));
  }
}
