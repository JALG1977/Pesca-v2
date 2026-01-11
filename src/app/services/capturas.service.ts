import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface Captura {
  id: number;
  usuarioId: number;
  titulo: string;
  descripcion?: string;
  fecha: string;

  // Ruta real del archivo en el dispositivo
  imagenUri: string;

  // Ruta convertida para usar en <img [src]>
  imagenWebPath?: string;
}

@Injectable({ providedIn: 'root' })
export class CapturasService {

  private getKey(usuarioId: number): string {
    return `capturas_${usuarioId}`;
  }

  private leerMeta(usuarioId: number): Captura[] {
    try {
      const raw = localStorage.getItem(this.getKey(usuarioId));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as Captura[];
    } catch {
      return [];
    }
  }

  private guardarMeta(usuarioId: number, capturas: Captura[]) {
    localStorage.setItem(this.getKey(usuarioId), JSON.stringify(capturas));
  }

  private dataUrlToBase64(dataUrl: string): { base64: string; ext: string } {
    // data:image/jpeg;base64,AAAA...
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      return { base64: dataUrl, ext: 'jpg' };
    }
    const mime = match[1];
    const base64 = match[2];
    const ext = mime.includes('png') ? 'png' : 'jpg';
    return { base64, ext };
  }

  async obtenerCapturas(usuarioId: number): Promise<Captura[]> {
    const lista = this.leerMeta(usuarioId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return lista.map(c => ({
      ...c,
      imagenWebPath: Capacitor.convertFileSrc(c.imagenUri),
    }));
  }

  async agregarCapturaDesdeDataUrl(params: {
    usuarioId: number;
    titulo: string;
    descripcion?: string;
    dataUrl: string;
  }): Promise<void> {

    const id = Date.now();
    const fecha = new Date().toISOString();

    const { base64, ext } = this.dataUrlToBase64(params.dataUrl);

    const path = `capturas/u${params.usuarioId}/${id}.${ext}`;

   
    const writeRes = await Filesystem.writeFile({
      path,
      data: base64,
      directory: Directory.Data,
      recursive: true,
    });

    const meta: Captura = {
      id,
      usuarioId: params.usuarioId,
      titulo: params.titulo,
      descripcion: params.descripcion || '',
      fecha,
      imagenUri: writeRes.uri,
    };

    const actuales = this.leerMeta(params.usuarioId);
    actuales.push(meta);
    this.guardarMeta(params.usuarioId, actuales);
  }
}
