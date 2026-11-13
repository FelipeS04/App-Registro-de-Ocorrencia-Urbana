
import React, { useState } from 'react';

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import { auth } from '../firebaseConfig';
import { salvarUsuarioFirebase } from '../database';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  async function cadastrar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Digite seu nome.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Atenção', 'Digite seu e-mail.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não são iguais.');
      return;
    }

    try {
      // Cria a conta no Firebase.
      const credencial = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        senha
      );

      // Salva o nome no perfil do Firebase.
      await updateProfile(credencial.user, {
        displayName: nome.trim(),
      });

      // Registra o usuário também no SQLite.
      await salvarUsuarioFirebase(
        credencial.user.uid,
        nome.trim(),
        credencial.user.email
      );

      Alert.alert(
        'Cadastro realizado!',
        'Sua conta foi criada com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );

    } catch (erro) {
      console.log('Erro ao cadastrar:', erro);

      if (erro.code === 'auth/email-already-in-use') {
        Alert.alert('E-mail já cadastrado', 'Utilize outro e-mail.');
      } else if (erro.code === 'auth/invalid-email') {
        Alert.alert('E-mail inválido', 'Verifique o endereço informado.');
      } else if (erro.code === 'auth/weak-password') {
        Alert.alert('Senha fraca', 'Escolha uma senha mais segura.');
      } else {
        Alert.alert('Erro', erro.message || 'Não foi possível realizar o cadastro.');
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.faixaAzul} />
      <View style={styles.faixaAmarela} />

      <View style={styles.conteudo}>
        <Text style={styles.icone}>🚨</Text>

        <Text style={styles.titulo}>Criar conta</Text>

        <Text style={styles.subtitulo}>Ocorrências Urbanas</Text>

        <Text style={styles.instrucao}>Cadastre seus dados</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#888"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#888"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirme sua senha"
          placeholderTextColor="#888"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.botao}
          onPress={cadastrar}
        >
          <Text style={styles.textoBotao}>Criar conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.voltar}>
            Já possui uma conta? Entrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },

  faixaAzul: {
    position: 'absolute',
    width: width * 1.5,
    height: 75,
    backgroundColor: '#1565C0',
    top: 20,
    left: -width * 0.35,
    transform: [{ rotate: '-12deg' }],
  },

  faixaAmarela: {
    position: 'absolute',
    width: width * 1.5,
    height: 25,
    backgroundColor: '#FFD600',
    top: 85,
    left: -width * 0.3,
    transform: [{ rotate: '-12deg' }],
  },

  conteudo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  icone: {
    fontSize: 48,
    marginBottom: 5,
  },

  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1565C0',
  },

  subtitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },

  instrucao: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
  },

  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },

  botao: {
    width: '100%',
    height: 50,
    backgroundColor: '#1565C0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  textoBotao: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  voltar: {
    marginTop: 20,
    color: '#1565C0',
    fontSize: 15,
  },
});
