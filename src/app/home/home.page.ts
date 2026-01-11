import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { CapturasService, Captura } from '../services/capturas.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule, RouterModule],
})
export class HomePage implements OnInit {
  capturas: Captura[] = [];
  cargando = false;

  constructor(
    private capturasService: CapturasService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarCapturas();
  }

  async ionViewWillEnter() {
    // cuando vuelves desde agregarimagen, refresca
    await this.cargarCapturas();
  }

  async cargarCapturas(event?: any) {
    this.cargando = true;

    try {
      const usuario = await this.authService.getUsuarioActual();
      if (!usuario) {
        const alert = await this.alertCtrl.create({
          header: 'Sesión no válida',
          message: 'Debes iniciar sesión nuevamente.',
          buttons: ['OK'],
        });
        await alert.present();
        this.router.navigateByUrl('/login', { replaceUrl: true });
        return;
      }

      // Ya viene ordenado DESC desde el service (última primero)
      const lista = await this.capturasService.obtenerCapturas(usuario.id);

      // Reasignación limpia para forzar render
      this.capturas = [...lista];

    } catch (error) {
      console.error('Error cargando capturas:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudieron cargar las capturas.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.cargando = false;
      if (event) event.target.complete();
    }
  }

  irAgregar() {
    this.router.navigateByUrl('/agregarimagen');
  }

  async cerrarSesion() {
    await this.authService.cerrarSesion();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
