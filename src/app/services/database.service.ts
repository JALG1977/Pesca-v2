import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

export interface Usuario {
  usuario_id: number;
  nombre: string;
  email: string;
  password: string;
  estado: number;
  creado_en: number;
}

// interfaz para las fotos (imágenes de las capturas)
export interface Foto {
  foto_id: number;
  usuario_id: number;
  lugar_id: number | null;
  titulo: string | null;
  descripcion: string | null;
  uri: string;
  creado_en: number;
}

// interfaz para las capturas (datos de la pesca)
export interface Captura {
  captura_id: number;
  peso: number | null;
  usuario_id: number;
  señuelo: string | null;
  especie: string | null;
  creado_en: number;
}

/* =======================
   FORO
   ======================= */
export interface ForoTema {
  foro_tema_id: number;
  usuario_id: number;
  titulo: string;
  descripcion: string | null;
  autor_nombre: string | null;
  creado_en: number;
}

export interface ForoMensaje {
  foro_mensaje_id: number;
  foro_tema_id: number;
  usuario_id: number;
  texto: string;
  creado_en: number;


  autor_nombre?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly dbName = 'pescaDB';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  // Llamar una vez al inicio de la app
  async init(): Promise<void> {
    try {
      const retCC = (await this.sqlite.checkConnectionsConsistency()).result;
      const isConn = (await this.sqlite.isConnection(this.dbName, false)).result;

      if (!isConn && !retCC) {
        // Crear nueva conexión
        this.db = await this.sqlite.createConnection(
          this.dbName,
          false,
          'no-encryption',
          1,
          false
        );
      } else {
        // Recuperar conexión existente
        this.db = await this.sqlite.retrieveConnection(this.dbName, false);
      }

      await this.db.open();
      await this.setupDatabase();
    } catch (error) {
      console.error('Error inicializando la base de datos:', error);
      throw error;
    }
  }

  private ensureDb(): SQLiteDBConnection {
    if (!this.db) {
      throw new Error('La base de datos no está inicializada');
    }
    return this.db;
  }

  // Crea tablas si no existen
  private async setupDatabase(): Promise<void> {
    const db = this.ensureDb();

    await db.execute('PRAGMA foreign_keys = ON;');

    const schema = `
      CREATE TABLE IF NOT EXISTS region (
        region_id      INTEGER PRIMARY KEY AUTOINCREMENT,
        region_nombre  TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comuna (
        comuna_id      INTEGER PRIMARY KEY AUTOINCREMENT,
        region_id      INTEGER NOT NULL,
        comuna_nombre  TEXT NOT NULL,
        FOREIGN KEY (region_id)
          REFERENCES region (region_id)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      );

      CREATE TABLE IF NOT EXISTS lugar (
        lugar_id          INTEGER PRIMARY KEY AUTOINCREMENT,
        lugar_nombre      TEXT,
        lugar_descripcion TEXT,
        lugar_gps         TEXT,
        comuna_id         INTEGER NOT NULL,
        FOREIGN KEY (comuna_id)
          REFERENCES comuna (comuna_id)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      );

      CREATE TABLE IF NOT EXISTS usuario (
        usuario_id  INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre      TEXT NOT NULL,
        apellido    TEXT,
        email       TEXT NOT NULL UNIQUE,
        password    TEXT NOT NULL,
        estado      INTEGER NOT NULL DEFAULT 1,
        creado_en   INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS foro_tema (
        foro_tema_id   INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id     INTEGER NOT NULL,
        titulo         TEXT NOT NULL,
        descripcion    TEXT,
        autor_nombre   TEXT,
        creado_en      INTEGER NOT NULL,
        FOREIGN KEY (usuario_id)
          REFERENCES usuario (usuario_id)
          ON DELETE CASCADE
          ON UPDATE NO ACTION
      );

      CREATE TABLE IF NOT EXISTS foro_mensaje (
        foro_mensaje_id  INTEGER PRIMARY KEY AUTOINCREMENT,
        foro_tema_id     INTEGER NOT NULL,
        usuario_id       INTEGER NOT NULL,
        texto            TEXT NOT NULL,
        creado_en        INTEGER NOT NULL,
        FOREIGN KEY (foro_tema_id)
          REFERENCES foro_tema (foro_tema_id)
          ON DELETE CASCADE
          ON UPDATE NO ACTION,
        FOREIGN KEY (usuario_id)
          REFERENCES usuario (usuario_id)
          ON DELETE CASCADE
          ON UPDATE NO ACTION
      );

      CREATE TABLE IF NOT EXISTS foto (
        foto_id       INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id    INTEGER NOT NULL,
        lugar_id      INTEGER,
        titulo        TEXT,
        descripcion   TEXT,
        uri           TEXT NOT NULL,
        creado_en     INTEGER NOT NULL,
        FOREIGN KEY (usuario_id)
          REFERENCES usuario (usuario_id)
          ON DELETE CASCADE
          ON UPDATE NO ACTION,
        FOREIGN KEY (lugar_id)
          REFERENCES lugar (lugar_id)
          ON DELETE SET NULL
          ON UPDATE NO ACTION
      );

      CREATE TABLE IF NOT EXISTS captura (
        captura_id INTEGER PRIMARY KEY AUTOINCREMENT,
        peso       INTEGER,
        usuario_id INTEGER NOT NULL,
        señuelo    TEXT,
        especie    TEXT,
        creado_en  INTEGER NOT NULL,
        FOREIGN KEY (usuario_id)
          REFERENCES usuario (usuario_id)
          ON DELETE CASCADE
          ON UPDATE NO ACTION
      );
    `;

    await db.execute(schema);

    // (SOLO FORO) 
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_foro_tema_creado_en ON foro_tema (creado_en DESC);
      CREATE INDEX IF NOT EXISTS idx_foro_mensaje_tema_creado_en ON foro_mensaje (foro_tema_id, creado_en ASC);
    `);
  }

  // ------------------ USUARIOS: REGISTRO ------------------ //

  async registrarUsuario(
    nombre: string,
    email: string,
    password: string
  ): Promise<void> {
    const db = this.ensureDb();
    const ahora = Date.now();

    const sql = `
      INSERT INTO usuario (nombre, email, password, estado, creado_en)
      VALUES (?, ?, ?, 1, ?);
    `;

    try {
      await db.run(sql, [nombre, email, password, ahora]);
    } catch (error: any) {
      if (typeof error?.message === 'string' && error.message.includes('UNIQUE')) {
        throw new Error('El correo ya está registrado');
      }
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // ------------------ USUARIOS: LOGIN ------------------ //

  async login(email: string, password: string): Promise<Usuario | null> {
    const db = this.ensureDb();

    const sql = `
      SELECT usuario_id, nombre, email, password, estado, creado_en
      FROM usuario
      WHERE email = ? AND password = ? AND estado = 1
      LIMIT 1;
    `;

    const result = await db.query(sql, [email, password]);
    const values = result.values || [];

    if (values.length > 0) {
      return values[0] as Usuario;
    }

    return null;
  }

  // ------------------ FOTOS (IMÁGENES DE CAPTURAS) ------------------ //

  async agregarFoto(
    usuarioId: number,
    uri: string,
    titulo?: string,
    descripcion?: string,
    lugarId?: number | null
  ): Promise<number> {
    const db = this.ensureDb();
    const ahora = Date.now();

    const sql = `
      INSERT INTO foto (usuario_id, lugar_id, titulo, descripcion, uri, creado_en)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    const res = await db.run(sql, [
      usuarioId,
      lugarId ?? null,
      titulo ?? null,
      descripcion ?? null,
      uri,
      ahora,
    ]);

    const lastId = res.changes?.lastId;
    if (!lastId) {
      throw new Error('No se pudo obtener el id de la foto insertada');
    }
    return lastId;
  }

  /**
   * Obtiene todas las fotos de un usuario ordenadas por fecha (más recientes primero)
   */
  async obtenerFotosPorUsuario(usuarioId: number): Promise<Foto[]> {
    const db = this.ensureDb();

    const sql = `
      SELECT foto_id, usuario_id, lugar_id, titulo, descripcion, uri, creado_en
      FROM foto
      WHERE usuario_id = ?
      ORDER BY creado_en DESC;
    `;

    const result = await db.query(sql, [usuarioId]);
    return (result.values || []) as Foto[];
  }

  /**
   * Obtener una sola foto por id para el modal
   */
  async obtenerFotoPorId(fotoId: number): Promise<Foto | null> {
    const db = this.ensureDb();

    const sql = `
      SELECT foto_id, usuario_id, lugar_id, titulo, descripcion, uri, creado_en
      FROM foto
      WHERE foto_id = ?
      LIMIT 1;
    `;

    const result = await db.query(sql, [fotoId]);
    const values = result.values || [];
    if (values.length === 0) {
      return null;
    }
    return values[0] as Foto;
  }

  // ------------------ CAPTURAS (DATOS DE LA PESCA) ------------------ //

  async registrarCaptura(
    usuarioId: number,
    peso?: number | null,
    señuelo?: string | null,
    especie?: string | null
  ): Promise<number> {
    const db = this.ensureDb();
    const ahora = Date.now();

    const sql = `
      INSERT INTO captura (peso, usuario_id, señuelo, especie, creado_en)
      VALUES (?, ?, ?, ?, ?);
    `;

    const res = await db.run(sql, [
      peso ?? null,
      usuarioId,
      señuelo ?? null,
      especie ?? null,
      ahora,
    ]);

    const lastId = res.changes?.lastId;
    if (!lastId) {
      throw new Error('No se pudo obtener el id de la captura insertada');
    }
    return lastId;
  }

  /**
   * Obtiene todas las capturas de un usuario ordenadas por fecha (más recientes primero)
   */
  async obtenerCapturasPorUsuario(usuarioId: number): Promise<Captura[]> {
    const db = this.ensureDb();

    const sql = `
      SELECT captura_id, peso, usuario_id, señuelo, especie, creado_en
      FROM captura
      WHERE usuario_id = ?
      ORDER BY creado_en DESC;
    `;

    const result = await db.query(sql, [usuarioId]);
    return (result.values || []) as Captura[];
  }

  /* =======================
     FORO 
     ======================= */

  // Crear un tema
  async foroCrearTema(
    usuarioId: number,
    titulo: string,
    descripcion: string | null,
    autorNombre: string
  ): Promise<number> {
    const db = this.ensureDb();
    const ahora = Date.now();

    const sql = `
      INSERT INTO foro_tema (usuario_id, titulo, descripcion, autor_nombre, creado_en)
      VALUES (?, ?, ?, ?, ?);
    `;

    const res = await db.run(sql, [
      usuarioId,
      titulo.trim(),
      (descripcion ?? '').trim() || null,
      autorNombre,
      ahora,
    ]);

    const lastId = res.changes?.lastId;
    if (!lastId) {
      throw new Error('No se pudo obtener el id del tema insertado');
    }
    return lastId;
  }

  // Listar temas (más recientes primero)
  async foroListarTemas(): Promise<ForoTema[]> {
    const db = this.ensureDb();

    const sql = `
      SELECT foro_tema_id, usuario_id, titulo, descripcion, autor_nombre, creado_en
      FROM foro_tema
      ORDER BY creado_en DESC;
    `;

    const result = await db.query(sql);
    return (result.values || []) as ForoTema[];
  }

  // Obtener un tema por ID
  async foroObtenerTemaPorId(foroTemaId: number): Promise<ForoTema | null> {
    const db = this.ensureDb();

    const sql = `
      SELECT foro_tema_id, usuario_id, titulo, descripcion, autor_nombre, creado_en
      FROM foro_tema
      WHERE foro_tema_id = ?
      LIMIT 1;
    `;

    const result = await db.query(sql, [foroTemaId]);
    const values = result.values || [];
    return values.length ? (values[0] as ForoTema) : null;
  }

  // Agregar mensaje a un tema
  async foroAgregarMensaje(
    foroTemaId: number,
    usuarioId: number,
    texto: string
  ): Promise<number> {
    const db = this.ensureDb();
    const ahora = Date.now();

    const sql = `
      INSERT INTO foro_mensaje (foro_tema_id, usuario_id, texto, creado_en)
      VALUES (?, ?, ?, ?);
    `;

    const res = await db.run(sql, [
      foroTemaId,
      usuarioId,
      texto.trim(),
      ahora,
    ]);

    const lastId = res.changes?.lastId;
    if (!lastId) {
      throw new Error('No se pudo obtener el id del mensaje insertado');
    }
    return lastId;
  }

  // Listar mensajes de un tema (orden cronológico)
 
  async foroListarMensajesPorTema(foroTemaId: number): Promise<ForoMensaje[]> {
    const db = this.ensureDb();

    const sql = `
      SELECT
        m.foro_mensaje_id,
        m.foro_tema_id,
        m.usuario_id,
        m.texto,
        m.creado_en,
        u.nombre AS autor_nombre
      FROM foro_mensaje m
      INNER JOIN usuario u ON u.usuario_id = m.usuario_id
      WHERE m.foro_tema_id = ?
      ORDER BY m.creado_en ASC;
    `;

    const result = await db.query(sql, [foroTemaId]);
    return (result.values || []) as ForoMensaje[];
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection(this.dbName, false);
      this.db = null;
    }
  }

  async debugUsuarios() {
    try {
      const db = this.db;
      if (!db) {
        console.error(' debugUsuarios(): La base de datos NO está inicializada (db = null)');
        return;
      }

      const result = await db.query('SELECT * FROM usuario');
      console.log(' Usuarios en BD:', result.values);
    } catch (e) {
      console.error('Error en debugUsuarios:', e);
    }
  }
}
