
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

let db;

export async function iniciarBanco() {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('ocorrencias.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      senha TEXT NOT NULL,
      foto_perfil TEXT,
      biometria_ativa INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ocorrencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      nivel TEXT NOT NULL,
      foto TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      usuario_id INTEGER NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);

  // Atualiza bancos antigos sem apagar os dados existentes.
  const colunas = await db.getAllAsync(
    'PRAGMA table_info(usuarios)'
  );

  if (!colunas.some(c => c.name === 'foto_perfil')) {
    await db.execAsync(
      'ALTER TABLE usuarios ADD COLUMN foto_perfil TEXT'
    );
  }

  if (!colunas.some(c => c.name === 'biometria_ativa')) {
    await db.execAsync(
      'ALTER TABLE usuarios ADD COLUMN biometria_ativa INTEGER DEFAULT 0'
    );
  }

  const usuarioAntigo = await AsyncStorage.getItem(
    '@ocorrencias_usuario'
  );

  if (usuarioAntigo) {
    const usuario = JSON.parse(usuarioAntigo);

    await db.runAsync(
      `INSERT OR IGNORE INTO usuarios (nome, email, senha)
       VALUES (?, ?, ?)`,
      [
        usuario.nome,
        usuario.email.trim().toLowerCase(),
        usuario.senha,
      ]
    );
  }

  return db;
}

export function obterBanco() {
  if (!db) {
    throw new Error('Banco de dados ainda não foi iniciado.');
  }

  return db;
}

export async function cadastrarUsuario(nome, email, senha) {
  const banco = obterBanco();

  await banco.runAsync(
    `INSERT INTO usuarios (nome, email, senha)
     VALUES (?, ?, ?)`,
    [nome.trim(), email.trim().toLowerCase(), senha]
  );
}

export async function buscarUsuario(email, senha) {
  const banco = obterBanco();

  return await banco.getFirstAsync(
    `SELECT id, nome, email, foto_perfil, biometria_ativa
     FROM usuarios
     WHERE email = ? COLLATE NOCASE AND senha = ?`,
    [email.trim(), senha]
  );
}

export async function buscarUsuarioPorEmail(email) {
  const banco = obterBanco();

  return await banco.getFirstAsync(
    `SELECT id, nome, email, foto_perfil, biometria_ativa
     FROM usuarios
     WHERE email = ? COLLATE NOCASE`,
    [email.trim()]
  );
}

export async function atualizarNome(usuarioId, nome) {
  const banco = obterBanco();

  await banco.runAsync(
    'UPDATE usuarios SET nome = ? WHERE id = ?',
    [nome.trim(), usuarioId]
  );
}

export async function atualizarFotoPerfil(usuarioId, foto) {
  const banco = obterBanco();

  await banco.runAsync(
    'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
    [foto, usuarioId]
  );
}

export async function atualizarBiometria(usuarioId, ativa) {
  const banco = obterBanco();

  await banco.runAsync(
    'UPDATE usuarios SET biometria_ativa = ? WHERE id = ?',
    [ativa ? 1 : 0, usuarioId]
  );
}

export async function salvarOcorrencia(ocorrencia, usuarioId) {
  const banco = obterBanco();

  await banco.runAsync(
    `INSERT INTO ocorrencias
     (descricao, nivel, foto, latitude, longitude, usuario_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      ocorrencia.descricao,
      ocorrencia.nivel,
      ocorrencia.foto,
      ocorrencia.latitude,
      ocorrencia.longitude,
      usuarioId,
    ]
  );
}

export async function listarOcorrencias() {
  const banco = obterBanco();

  return await banco.getAllAsync(`
    SELECT ocorrencias.*,
           usuarios.nome AS usuarioNome,
           usuarios.email AS usuarioEmail
    FROM ocorrencias
    INNER JOIN usuarios ON usuarios.id = ocorrencias.usuario_id
    ORDER BY ocorrencias.id DESC
  `);
}
