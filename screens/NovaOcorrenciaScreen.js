import React, { useState, useRef } from 'react';
import { sincronizarOcorrencias } from '../sincronizacao';

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import * as Location from 'expo-location';
import { salvarOcorrencia } from '../database';
import FaixasDecorativas from '../components/FaixasDecorativas';

export default function NovaOcorrenciaScreen({
  navigation,
  route,
}) {
  // =================================
  // DADOS DA OCORRÊNCIA
  // =================================
  const [descricao, setDescricao] = useState('');
  const [nivel, setNivel] = useState('');
  const [foto, setFoto] = useState(null);
  const [localizacao, setLocalizacao] = useState(null);
  const usuarioId = route.params?.usuarioId;
  // =================================
  // CÂMERA
  // =================================
  const [cameraAberta, setCameraAberta] = useState(false);
  const [permission, requestPermission] =
    useCameraPermissions();

  const cameraRef = useRef(null);


  // =================================
  // ABRIR CÂMERA
  // =================================

  async function abrirCamera() {
    if (!permission?.granted) {
      const resultado = await requestPermission();
      if (!resultado.granted) {
        alert(
          'Precisamos de permissão para usar a câmera.'
        );
        return;
      }
    }

    setCameraAberta(true);
  }
  // =================================
  // TIRAR FOTO
  // =================================

  async function tirarFoto() {
    if (!cameraRef.current) {
      return;
    }
    const fotoTirada = await cameraRef.current.takePictureAsync();
    setFoto(fotoTirada.uri);
    setCameraAberta(false);
  }


  // =================================
  // PEGAR LOCALIZAÇÃO
  // =================================

  async function pegarLocalizacao() {

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert(
        'Precisamos da sua localização para registrar a ocorrência.'
      );
      return;
    }
    const local = await Location.getCurrentPositionAsync({});
    setLocalizacao(local.coords);
  }
  // =================================
  // REGISTRAR OCORRÊNCIA
  // =================================


  async function registrarOcorrencia() {
    if (descricao.trim() === '') {
      alert('Digite uma descrição.');
      return;
    }

    if (nivel === '') {
      alert('Escolha o nível de perigo.');
      return;
    }

    if (!foto) {
      alert('Tire uma foto da ocorrência.');
      return;
    }

    if (!localizacao) {
      alert('Pegue a localização da ocorrência.');
      return;
    }

    if (!usuarioId) {
      alert('Não foi possível identificar sua conta. Entre novamente.');
      return;
    }

    try {
      const novaOcorrencia = {
        descricao: descricao.trim(),
        nivel,
        foto,
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
      };

      // Primeiro salva no SQLite.
      await salvarOcorrencia(novaOcorrencia, usuarioId);

      let mensagem = 'Ocorrência salva no celular.';

      // Depois tenta enviar ao Firebase.
      try {
        const resultado = await sincronizarOcorrencias();

        if (resultado.enviadas > 0) {
          mensagem += ` ${resultado.enviadas} ocorrência(s) enviada(s) ao Firebase.`;
        } else {
          mensagem += ' Nenhuma ocorrência pendente para enviar.';
        }
      } catch (erroFirebase) {
        console.log('Sincronização pendente:', erroFirebase);

        mensagem += ' Será sincronizada quando a conexão estiver disponível.';
      }

      alert(mensagem);

      navigation.navigate('TodasOcorrencias');

    } catch (erro) {
      console.log('Erro ao registrar ocorrência:', erro);
      alert('Não foi possível salvar a ocorrência.');
    }
  }

  // =================================
  // TELA
  // =================================
  return (
    cameraAberta ? (
      // =================================
      // TELA DA CÂMERA
      // =================================

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
        />
        <View style={styles.botoesCamera}>
          <Button
            title="📷 Tirar foto"
            onPress={tirarFoto}
          />
          <Button
            title="Cancelar"
            onPress={() => setCameraAberta(false)}
          />
        </View>
      </View>

    ) : (

      // =================================
      // FORMULÁRIO
      // =================================

      <ScrollView
        contentContainerStyle={styles.container}
      >
        <Text style={styles.titulo}>
          Nova ocorrência
        </Text>
        {/* =========================
            FOTO
        ========================= */}

        <Text style={styles.label}>
          Foto
        </Text>
        {foto && (

          <Image
            source={{ uri: foto }}
            style={styles.preview}
          />
        )}
        <Button
          title="📷 Tirar foto"
          onPress={abrirCamera}
        />

        {/* =========================
            DESCRIÇÃO
        ========================= */}
        <Text style={styles.label}>
          Descrição
        </Text>
        <TextInput
          style={styles.textarea}
          placeholder="Descreva o problema encontrado..."
          multiline
          numberOfLines={5}
          value={descricao}
          onChangeText={setDescricao}
        />

        {/* =========================
            NÍVEL DE PERIGO
        ========================= */}
        <Text style={styles.label}>
          Nível de perigo
        </Text>
        <View style={styles.niveis}>
          <TouchableOpacity
            style={[
              styles.nivel,
              nivel === 'Seguro' &&
              styles.nivelSelecionado,
            ]}
            onPress={() => setNivel('Seguro')}
          >
            <Text>
              🟢 Seguro
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nivel,
              nivel === 'Moderado' &&
              styles.nivelSelecionado,
            ]}
            onPress={() => setNivel('Moderado')}
          >
            <Text>
              🟡 Moderado
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nivel,
              nivel === 'Perigoso' &&
              styles.nivelSelecionado,
            ]}
            onPress={() => setNivel('Perigoso')}
          >
            <Text>
              🔴 Perigoso
            </Text>
          </TouchableOpacity>
        </View>


        {/* =========================
            LOCALIZAÇÃO
        ========================= */}

        <Text style={styles.label}>
          Localização
        </Text>


        {localizacao ? (

          <View style={styles.localizacaoObtida}>

            <Text>
              📍 Localização obtida
            </Text>

            <Text style={styles.coordenadas}>
              Latitude: {localizacao.latitude.toFixed(6)}
            </Text>

            <Text style={styles.coordenadas}>
              Longitude: {localizacao.longitude.toFixed(6)}
            </Text>

          </View>

        ) : (

          <Button
            title="📍 Pegar minha localização"
            onPress={pegarLocalizacao}
          />

        )}


        {/* =========================
            REGISTRAR
        ========================= */}

        <View style={styles.botaoRegistrar}>

          <Button
            title="Registrar ocorrência"
            onPress={registrarOcorrencia}
          />

        </View>


        {/* =========================
            VOLTAR
        ========================= */}

        <View style={styles.botaoVoltar}>

          <Button
            title="Voltar"
            onPress={() => navigation.goBack()}
          />

        </View>

      </ScrollView>

    )
  );
}


// =================================
// ESTILOS
// =================================

const styles = StyleSheet.create({

  container: {
    padding: 20,
    paddingBottom: 40,
  },


  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },


  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },


  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },


  niveis: {
    gap: 10,
  },


  nivel: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
  },


  nivelSelecionado: {
    borderWidth: 2,
    borderColor: '#e63946',
    backgroundColor: '#ffeaea',
  },


  preview: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 10,
  },


  localizacaoObtida: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },


  coordenadas: {
    marginTop: 5,
    fontSize: 13,
    color: '#555',
  },


  botaoRegistrar: {
    marginTop: 30,
  },


  botaoVoltar: {
    marginTop: 15,
  },


  // =================================
  // CÂMERA
  // =================================

  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },


  camera: {
    flex: 1,
  },


  botoesCamera: {
    padding: 20,
    gap: 10,
  },

});