
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';


import { signOut, updateProfile } from 'firebase/auth';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as LocalAuthentication from 'expo-local-authentication';

import { auth } from '../firebaseConfig';

import {
  atualizarNome,
  atualizarFotoPerfil,
  atualizarBiometria,
} from '../database';

export default function PerfilScreen({
  navigation,
  nome,
  email,
  usuarioId,
  fotoPerfil,
  setNome,
  setFotoPerfil,
  biometriaAtiva,
  setBiometriaAtiva,
}) {
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState(nome || '');
  const [biometriaDisponivel, setBiometriaDisponivel] = useState(false);
  const [carregandoFoto, setCarregandoFoto] = useState(false);

  useEffect(() => {
    setNovoNome(nome || '');
  }, [nome]);

  useEffect(() => {
    verificarBiometria();
  }, []);

  async function verificarBiometria() {
    try {
      const hardware =
        await LocalAuthentication.hasHardwareAsync();

      const cadastrada =
        await LocalAuthentication.isEnrolledAsync();

      setBiometriaDisponivel(hardware && cadastrada);
    } catch (erro) {
      console.log('Erro ao verificar biometria:', erro);
      setBiometriaDisponivel(false);
    }
  }

  async function escolherFoto() {
    try {
      const permissao =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso à galeria para escolher sua foto.'
        );
        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (resultado.canceled) return;

      setCarregandoFoto(true);

      const imagem = resultado.assets[0];
      const extensao = imagem.uri.split('.').pop()?.split('?')[0] || 'jpg';

      const destino =
        `${FileSystem.documentDirectory}perfil_${usuarioId}_${Date.now()}.${extensao}`;

      await FileSystem.copyAsync({
        from: imagem.uri,
        to: destino,
      });

      await atualizarFotoPerfil(usuarioId, destino);

      setFotoPerfil(destino);

      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
    } catch (erro) {
      console.log('Erro ao atualizar foto:', erro);
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
    } finally {
      setCarregandoFoto(false);
    }
  }

  async function updateProfile() {
    if (novoNome.trim() === '') {
      Alert.alert('Atenção', 'Digite um nome válido.');
      return;
    }

    try {
      await atualizarNome(usuarioId, novoNome);

      setNome(novoNome.trim());
      setEditandoNome(false);

      Alert.alert('Sucesso', 'Nome atualizado!');
    } catch (erro) {
      console.log('Erro ao atualizar nome:', erro);
      Alert.alert('Erro', 'Não foi possível atualizar o nome.');
    }
  }

  async function alterarBiometria(valor) {
    if (valor && !biometriaDisponivel) {
      Alert.alert(
        'Biometria indisponível',
        'Seu aparelho não possui biometria cadastrada.'
      );
      return;
    }

    try {
      await atualizarBiometria(usuarioId, valor);
      setBiometriaAtiva(valor);

      Alert.alert(
        'Biometria',
        valor
          ? 'Login biométrico ativado para esta conta.'
          : 'Login biométrico desativado para esta conta.'
      );
    } catch (erro) {
      console.log('Erro ao alterar biometria:', erro);
      Alert.alert('Erro', 'Não foi possível alterar a biometria.');
    }
  }

  async function sair() {
    try {
      if (!biometriaAtiva) {
        await signOut(auth);
      }

      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível sair da conta.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meu Perfil</Text>

      <TouchableOpacity
        style={styles.avatar}
        onPress={escolherFoto}
        disabled={carregandoFoto}
      >
        {carregandoFoto ? (
          <ActivityIndicator color="#1565C0" />
        ) : fotoPerfil ? (
          <Image
            source={{ uri: fotoPerfil }}
            style={styles.foto}
          />
        ) : (
          <Text style={styles.emoji}>👤</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={escolherFoto}>
        <Text style={styles.alterarFoto}>Alterar foto de perfil</Text>
      </TouchableOpacity>

      {editandoNome ? (
        <View style={styles.edicaoNome}>
          <TextInput
            style={styles.input}
            value={novoNome}
            onChangeText={setNovoNome}
            placeholder="Digite seu nome"
            maxLength={60}
          />

          <View style={styles.botoesEdicao}>
            <TouchableOpacity
              style={styles.botaoSalvar}
              onPress={updateProfile}
            >
              <Text style={styles.textoBotao}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => {
                setNovoNome(nome || '');
                setEditandoNome(false);
              }}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.nome}>{nome || 'Usuário'}</Text>

          <TouchableOpacity
            onPress={() => setEditandoNome(true)}
          >
            <Text style={styles.editarNome}>Editar nome</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.email}>
        {email || 'E-mail não informado'}
      </Text>

      <View style={styles.secaoBiometria}>
        <View style={styles.textosBiometria}>
          <Text style={styles.tituloBiometria}>
            Login com biometria
          </Text>

          <Text style={styles.descricaoBiometria}>
            Permitir entrar nesta conta usando a biometria do aparelho.
          </Text>
        </View>

        <Switch
          value={!!biometriaAtiva}
          onValueChange={alterarBiometria}
          disabled={!biometriaDisponivel}
          trackColor={{
            false: '#ccc',
            true: '#90CAF9',
          }}
          thumbColor={biometriaAtiva ? '#1565C0' : '#f4f3f4'}
        />
      </View>

      {!biometriaDisponivel && (
        <Text style={styles.avisoBiometria}>
          Nenhuma biometria disponível neste aparelho.
        </Text>
      )}

      <TouchableOpacity
        style={styles.botao}
        onPress={() => navigation.navigate('MinhasOcorrencias')}
      >
        <Text style={styles.textoBotao}>Minhas ocorrências</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSecundario}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.textoSecundario}>Voltar ao início</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSair}
        onPress={sair}
      >
        <Text style={styles.textoSair}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 25,
    paddingTop: 35,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 25,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e8f1fc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 55,
  },
  alterarFoto: {
    color: '#1565C0',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  editarNome: {
    color: '#1565C0',
    marginTop: 5,
    fontWeight: '600',
  },
  email: {
    fontSize: 15,
    color: '#777',
    marginTop: 8,
    marginBottom: 20,
  },
  edicaoNome: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
  },
  botoesEdicao: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  botaoSalvar: {
    backgroundColor: '#1565C0',
    padding: 10,
    borderRadius: 8,
  },
  botaoCancelar: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  textoCancelar: {
    color: '#555',
  },
  secaoBiometria: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 8,
  },
  textosBiometria: {
    flex: 1,
    paddingRight: 10,
  },
  tituloBiometria: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  descricaoBiometria: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  avisoBiometria: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  botao: {
    width: '100%',
    padding: 15,
    backgroundColor: '#1565C0',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 12,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botaoSecundario: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#1565C0',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  textoSecundario: {
    color: '#1565C0',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botaoSair: {
    marginTop: 5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e63946',
    borderRadius: 8,
  },
  textoSair: {
    color: '#e63946',
    fontWeight: 'bold',
  },
});
