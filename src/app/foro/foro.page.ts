import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatabaseService, ForoTema } from '../services/database.service';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './foro.page.html',
  styleUrls: ['./foro.page.scss'],
})
export class ForoPage {
  temas: ForoTema[] = [];
  cargando = false;

  constructor(
    private db: DatabaseService,
    private router: Router
  ) {}

  async ionViewWillEnter() {
    console.log('[foro] ionViewWillEnter');
    await this.cargarTemas();
  }

  async cargarTemas(event?: any) {
    this.cargando = true;
    console.log('[foro] cargarTemas() inicio');

    try {
      this.temas = await this.db.foroListarTemas();
      console.log('[foro] temas desde DB:', this.temas);
    } catch (e: any) {
      console.error('[foro] Error al listar temas:', e);

      
      if (typeof e?.message === 'string' && e.message.includes('no está inicializada')) {
        console.log('[foro] DB no inicializada -> init() y reintento');
        await this.db.init();
        this.temas = await this.db.foroListarTemas();
        console.log('[foro] temas tras reintento:', this.temas);
      }
    } finally {
      this.cargando = false;
      if (event) event.target.complete();
      console.log('[foro] cargarTemas() fin');
    }
  }

  irAgregarTema() {
    this.router.navigateByUrl('/agregartema');
  }

  abrirTema(tema: ForoTema) {
    console.log('[foro] abrirTema:', tema);
    this.router.navigateByUrl(`/temaforo/${tema.foro_tema_id}`);
  }

  formatearFecha(ms: number) {
    return new Date(ms).toLocaleString();
  }
}
