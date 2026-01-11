import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';

import { WeatherService, OpenMeteoResponse } from '../services/weather.service';
import { AuthService } from '../services/auth.service';

type Localidad = {
  id: string;
  nombre: string;
  lat: number;
  lon: number;
};

@Component({
  selector: 'app-clima',
  standalone: true,
  templateUrl: './clima.page.html',
  styleUrls: ['./clima.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class ClimaPage implements OnInit {
  localidades: Localidad[] = [
    { id: 'stgo', nombre: 'Santiago', lat: -33.45, lon: -70.66 },
    { id: 'valpo', nombre: 'Valparaíso', lat: -33.0472, lon: -71.6127 },
    { id: 'conce', nombre: 'Concepción', lat: -36.8260, lon: -73.0498 },
    { id: 'temu', nombre: 'Temuco', lat: -38.7359, lon: -72.5904 },
  ];

  localidadSeleccionadaId = this.localidades[0].id;

  cargando = false;

  temperaturaC: number | null = null;
  vientoKmh: number | null = null;
  direccionViento: number | null = null;
  estado: string | null = null;
  ultimaActualizacion: string | null = null;

  constructor(
    private weatherService: WeatherService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarClima();
  }

  async onCambiarLocalidad() {
    await this.cargarClima();
  }

  async cargarClima(event?: any) {
    this.cargando = true;

    try {
      // Coherencia con el resto de la app: validar sesión
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

      const loc = this.localidades.find(l => l.id === this.localidadSeleccionadaId);
      if (!loc) {
        throw new Error('Localidad no encontrada');
      }

      const resp: OpenMeteoResponse = await this.weatherService.getCurrentWeather(loc.lat, loc.lon);
      const cw = resp.current_weather;

      this.temperaturaC = cw?.temperature ?? null;
      this.vientoKmh = cw?.windspeed ?? null;
      this.direccionViento = cw?.winddirection ?? null;
      this.estado = this.weatherService.mapWeatherCode(cw?.weathercode);
      this.ultimaActualizacion = cw?.time ? String(cw.time).replace('T', ' ') : null;

    } catch (error) {
      console.error('Error cargando clima:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo obtener el clima. Revisa tu conexión e inténtalo nuevamente.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.cargando = false;
      if (event) event.target.complete();
    }
  }

  volverHome() {
    this.router.navigateByUrl('/home');
  }

  get nombreLocalidadActual(): string {
    return this.localidades.find(l => l.id === this.localidadSeleccionadaId)?.nombre ?? '';
  }
}
