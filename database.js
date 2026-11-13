
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
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
      biometria_ativa INTEGER DEFAULT 0,
      firebase_uid TEXT
    );

    CREATE TABLE IF NOT EXISTS ocorrencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      nivel TEXT NOT NULL,
      foto TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      usuario_id INTEGER NOT NULL,
      cloud_id TEXT,
      sync_status TEXT DEFAULT 'pending',
      updated_at TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);

  // Migrações de usuários antigos.
  const colunasUsuarios = await db.getAllAsync(
    'PRAGMA table_info(usuarios)'
  );

  if (!colunasUsuarios.some(c => c.name === 'foto_perfil')) {
    await db.execAsync(
      'ALTER TABLE usuarios ADD COLUMN foto_perfil TEXT'
    );
  }

  if (!colunasUsuarios.some(c => c.name === 'biometria_ativa')) {
    await db.execAsync(
      'ALTER TABLE usuarios ADD COLUMN biometria_ativa INTEGER DEFAULT 0'
    );
  }

  if (!colunasUsuarios.some(c => c.name === 'firebase_uid')) {
    await db.execAsync(
      'ALTER TABLE usuarios ADD COLUMN firebase_uid TEXT'
    );
  }

  await db.execAsync(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_firebase_uid
    ON usuarios(firebase_uid);
  `);

  // Migrações de ocorrências antigas.
  const colunasOcorrencias = await db.getAllAsync(
    'PRAGMA table_info(ocorrencias)'
  );

  if (!colunasOcorrencias.some(c => c.name === 'cloud_id')) {
    await db.execAsync(
      'ALTER TABLE ocorrencias ADD COLUMN cloud_id TEXT'
    );
  }

  if (!colunasOcorrencias.some(c => c.name === 'sync_status')) {
    await db.execAsync(
      "ALTER TABLE ocorrencias ADD COLUMN sync_status TEXT DEFAULT 'pending'"
    );
  }

  if (!colunasOcorrencias.some(c => c.name === 'updated_at')) {
    await db.execAsync(
      'ALTER TABLE ocorrencias ADD COLUMN updated_at TEXT'
    );
  }

  // Gera identificadores para ocorrências que já existiam.
  await db.execAsync(`
    UPDATE ocorrencias
    SET cloud_id = lower(hex(randomblob(16)))
    WHERE cloud_id IS NULL OR cloud_id = '';

    UPDATE ocorrencias
    SET sync_status = 'pending'
    WHERE sync_status IS NULL OR sync_status = '';

    UPDATE ocorrencias
    SET updated_at = datetime('now')
    WHERE updated_at IS NULL OR updated_at = '';

    CREATE UNIQUE INDEX IF NOT EXISTS idx_ocorrencias_cloud_id
    ON ocorrencias(cloud_id);
  `);

  // Migração de usuário antigo do AsyncStorage.
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

// Salva ou atualiza o usuário autenticado pelo Firebase.

export async function salvarUsuarioFirebase(
  firebaseUid,
  nome,
  email
) {
  const banco = obterBanco();

  const emailNormalizado = email.trim().toLowerCase();

  const usuarioExistente = await banco.getFirstAsync(
    `SELECT * FROM usuarios WHERE email = ? COLLATE NOCASE`,
    [emailNormalizado]
  );

  if (usuarioExistente) {
    if (
      usuarioExistente.firebase_uid &&
      usuarioExistente.firebase_uid !== firebaseUid
    ) {
      throw new Error(
        'Esta conta local já está vinculada a outro usuário Firebase.'
      );
    }

    // Preserva o nome e a foto já salvos localmente.
    await banco.runAsync(
      `UPDATE usuarios
       SET firebase_uid = ?, senha = ''
       WHERE id = ?`,
      [
        firebaseUid,
        usuarioExistente.id,
      ]
    );

    return await banco.getFirstAsync(
      'SELECT * FROM usuarios WHERE id = ?',
      [usuarioExistente.id]
    );
  }

  await banco.runAsync(
    `INSERT INTO usuarios
     (nome, email, senha, firebase_uid)
     VALUES (?, ?, '', ?)`,
    [nome?.trim() || 'Usuário', emailNormalizado, firebaseUid]
  );

  return await banco.getFirstAsync(
    'SELECT * FROM usuarios WHERE firebase_uid = ?',
    [firebaseUid]
  );
}


export async function buscarUsuarioPorFirebaseUid(firebaseUid) {
  const banco = obterBanco();

  return await banco.getFirstAsync(
    'SELECT * FROM usuarios WHERE firebase_uid = ?',
    [firebaseUid]
  );
}

export async function buscarUsuarioPorEmail(email) {
  const banco = obterBanco();

  return await banco.getFirstAsync(
    `SELECT id, nome, email, foto_perfil,
            biometria_ativa, firebase_uid
     FROM usuarios
     WHERE email = ? COLLATE NOCASE`,
    [email.trim()]
  );
}

// Mantida temporariamente para migrar contas antigas.
export async function buscarUsuario(email, senha) {
  const banco = obterBanco();

  return await banco.getFirstAsync(
    `SELECT id, nome, email, foto_perfil,
            biometria_ativa, firebase_uid
     FROM usuarios
     WHERE email = ? COLLATE NOCASE AND senha = ?`,
    [email.trim(), senha]
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

// Salva uma ocorrência local como pendente de sincronização.
export async function salvarOcorrencia(ocorrencia, usuarioId) {
  const banco = obterBanco();

  const cloudId = Crypto.randomUUID();
  const agora = new Date().toISOString();

  await banco.runAsync(
    `INSERT INTO ocorrencias
     (
       descricao,
       nivel,
       foto,
       latitude,
       longitude,
       usuario_id,
       cloud_id,
       sync_status,
       updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      ocorrencia.descricao,
      ocorrencia.nivel,
      ocorrencia.foto,
      ocorrencia.latitude,
      ocorrencia.longitude,
      usuarioId,
      cloudId,
      agora,
    ]
  );
}

// Lista todas as ocorrências que ainda precisam ser enviadas.
export async function listarOcorrenciasPendentes() {
  const banco = obterBanco();

  return await banco.getAllAsync(`
    SELECT ocorrencias.*,
           usuarios.nome AS usuarioNome,
           usuarios.email AS usuarioEmail,
           usuarios.firebase_uid AS usuarioFirebaseUid
    FROM ocorrencias
    INNER JOIN usuarios ON usuarios.id = ocorrencias.usuario_id
    WHERE ocorrencias.sync_status = 'pending'
    ORDER BY ocorrencias.id ASC
  `);
}

// Marca uma ocorrência como sincronizada após confirmação do Firebase.
export async function marcarOcorrenciaSincronizada(cloudId) {
  const banco = obterBanco();

  await banco.runAsync(
    `UPDATE ocorrencias
     SET sync_status = 'synced'
     WHERE cloud_id = ?`,
    [cloudId]
  );
}

// Lista todas as ocorrências locais.
export async function listarOcorrencias() {
  const banco = obterBanco();

  return await banco.getAllAsync(`
    SELECT ocorrencias.*,
           usuarios.nome AS usuarioNome,
           usuarios.email AS usuarioEmail,
           usuarios.firebase_uid AS usuarioFirebaseUid
    FROM ocorrencias
    INNER JOIN usuarios ON usuarios.id = ocorrencias.usuario_id
    WHERE ocorrencias.sync_status != 'deleted_pending'
    ORDER BY ocorrencias.id DESC
  `);
}


// Solicita a exclusão de uma ocorrência pertencente ao usuário.
export async function solicitarExclusaoOcorrencia(
  ocorrenciaId,
  usuarioId,
  firebaseUid
) {
  const banco = obterBanco();

  const ocorrencia = await banco.getFirstAsync(
    `SELECT ocorrencias.*,
            usuarios.firebase_uid AS usuarioFirebaseUid
     FROM ocorrencias
     INNER JOIN usuarios ON usuarios.id = ocorrencias.usuario_id
     WHERE ocorrencias.id = ? AND ocorrencias.usuario_id = ?`,
    [ocorrenciaId, usuarioId]
  );

  if (!ocorrencia) {
    throw new Error('Ocorrência não encontrada ou não pertence a você.');
  }

  if (ocorrencia.usuarioFirebaseUid !== firebaseUid) {
  throw new Error('Esta ocorrência não pertence à sua conta.');
  }

  if (
    ocorrencia.sync_status === 'synced' &&
    ocorrencia.cloud_id
  ) {
    // Mantém o registro local até confirmar a exclusão na nuvem.
    await banco.runAsync(
      `UPDATE ocorrencias
       SET sync_status = 'deleted_pending'
       WHERE id = ?`,
      [ocorrenciaId]
    );

    return ocorrencia;
  }

  // Se nunca foi sincronizada, basta apagar localmente.
  await banco.runAsync(
    'DELETE FROM ocorrencias WHERE id = ?',
    [ocorrenciaId]
  );

  return {
    ...ocorrencia,
    exclusaoLocal: true,
  };
}

// Busca exclusões que aguardam conexão com o Firebase.
export async function listarExclusoesPendentes() {
  const banco = obterBanco();

  return await banco.getAllAsync(`
    SELECT ocorrencias.*,
           usuarios.firebase_uid AS usuarioFirebaseUid
    FROM ocorrencias
    INNER JOIN usuarios ON usuarios.id = ocorrencias.usuario_id
    WHERE ocorrencias.sync_status = 'deleted_pending'
  `);
}

// Remove definitivamente o registro local após excluir da nuvem.
export async function finalizarExclusaoOcorrencia(cloudId) {
  const banco = obterBanco();

  await banco.runAsync(
    `DELETE FROM ocorrencias
     WHERE cloud_id = ? AND sync_status = 'deleted_pending'`,
    [cloudId]
  );
}
