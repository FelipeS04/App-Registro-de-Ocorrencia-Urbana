
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from './firebaseConfig';

import {
  listarOcorrenciasPendentes,
  marcarOcorrenciaSincronizada,
  solicitarExclusaoOcorrencia,
  listarExclusoesPendentes,
  finalizarExclusaoOcorrencia,
} from './database';

// Envia ocorrências novas para o Firebase.
export async function sincronizarOcorrencias() {
  const usuarioFirebase = auth.currentUser;

  if (!usuarioFirebase) {
    throw new Error('Nenhum usuário está autenticado no Firebase.');
  }

  let enviadas = 0;
  let excluidas = 0;

  // Primeiro conclui as exclusões pendentes.
  const exclusoes = await listarExclusoesPendentes();

  const minhasExclusoes = exclusoes.filter(
    item => item.usuarioFirebaseUid === usuarioFirebase.uid
  );

  for (const ocorrencia of minhasExclusoes) {
    const referencia = doc(
      db,
      'ocorrencias',
      ocorrencia.cloud_id
    );

    await deleteDoc(referencia);

    await finalizarExclusaoOcorrencia(ocorrencia.cloud_id);

    excluidas++;
  }

  // Depois envia as ocorrências novas.
  const pendentes = await listarOcorrenciasPendentes();

  const minhasPendentes = pendentes.filter(
    ocorrencia =>
      ocorrencia.usuarioFirebaseUid === usuarioFirebase.uid
  );

  for (const ocorrencia of minhasPendentes) {
    const dados = {
      id: ocorrencia.cloud_id,
      descricao: ocorrencia.descricao,
      nivel: ocorrencia.nivel,
      latitude: ocorrencia.latitude,
      longitude: ocorrencia.longitude,
      usuarioUid: usuarioFirebase.uid,
      usuarioNome: ocorrencia.usuarioNome,
      temFoto: Boolean(ocorrencia.foto),
      createdAtLocal: ocorrencia.updated_at,
      updatedAt: serverTimestamp(),
    };

    const referencia = doc(
      db,
      'ocorrencias',
      ocorrencia.cloud_id
    );

    await setDoc(referencia, dados, { merge: true });

    await marcarOcorrenciaSincronizada(ocorrencia.cloud_id);

    enviadas++;
  }

  return {
    enviadas,
    excluidas,
    pendentes: pendentes.length,
    exclusoesPendentes: exclusoes.length - minhasExclusoes.length,
    ignoradas: pendentes.length - minhasPendentes.length,
  };
}

// Exclui uma ocorrência do usuário.
export async function excluirOcorrencia(
  ocorrenciaId,
  usuarioId
) {
  const usuarioFirebase = auth.currentUser;

  if (!usuarioFirebase) {
    throw new Error('Nenhum usuário está autenticado no Firebase.');
  }

  const ocorrencia = await solicitarExclusaoOcorrencia(
    ocorrenciaId,
    usuarioId,
    usuarioFirebase.uid
  );


  // Ocorrência ainda não enviada: já foi removida do SQLite.
  if (ocorrencia.exclusaoLocal) {
    return { excluida: true, pendenteNuvem: false };
  }

  try {
    const referencia = doc(
      db,
      'ocorrencias',
      ocorrencia.cloud_id
    );

    await deleteDoc(referencia);

    await finalizarExclusaoOcorrencia(ocorrencia.cloud_id);

    return { excluida: true, pendenteNuvem: false };

  } catch (erro) {
    // Se não houver conexão, a exclusão ficará pendente.
    // A próxima sincronização tentará novamente.
    console.log('Exclusão aguardando sincronização:', erro);

    return { excluida: true, pendenteNuvem: true };
  }
}
