
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import { auth } from '../firebaseConfig';

import {
  buscarUsuario,
  buscarUsuarioPorEmail,
  salvarUsuarioFirebase,
} from '../database';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [biometriaDisponivel, setBiometriaDisponivel] = useState(false);
  const [contaBiometrica, setContaBiometrica] = useState(null);

  useEffect(() => {
    verificarBiometria();
  }, []);

  useEffect(() => {
    let ativo = true;

    async function verificarConta() {
      setContaBiometrica(null);

      if (!email.trim()) return;

      try {
        const usuario = await buscarUsuarioPorEmail(email.trim());

        if (ativo && usuario && usuario.biometria_ativa === 1) {
          setContaBiometrica(usuario);
        }
      } catch (erro) {
        console.log('Erro ao verificar conta:', erro);
      }
    }

    verificarConta();

    return () => {
      ativo = false;
    };
  }, [email]);

  async function verificarBiometria() {
    try {
      const possuiHardware =
        await LocalAuthentication.hasHardwareAsync();

      const possuiBiometriaCadastrada =
        await LocalAuthentication.isEnrolledAsync();

      setBiometriaDisponivel(
        possuiHardware && possuiBiometriaCadastrada
      );
    } catch (erro) {
      console.log('Erro ao verificar biometria:', erro);
      setBiometriaDisponivel(false);
    }
  }

  function entrarNaConta(usuario) {
    navigation.replace('Principal', {
      usuarioId: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      foto_perfil: usuario.foto_perfil,
      biometria_ativa: usuario.biometria_ativa,
      firebaseUid: usuario.firebase_uid,
    });
  }
  async function entrar() {
    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado) {
      Alert.alert('Atenção', 'Digite seu e-mail.');
      return;
    }

    if (!senha) {
      Alert.alert('Atenção', 'Digite sua senha.');
      return;
    }

    try {
      let credencial;

      try {
        credencial = await signInWithEmailAndPassword(
          auth,
          emailNormalizado,
          senha
        );

      } catch (erroFirebase) {
        if (
          erroFirebase.code !== 'auth/user-not-found' &&
          erroFirebase.code !== 'auth/invalid-credential'
        ) {
          throw erroFirebase;
        }

        const usuarioAntigo = await buscarUsuario(
          emailNormalizado,
          senha
        );

        if (!usuarioAntigo) {
          Alert.alert('Login inválido', 'E-mail ou senha incorretos.');
          return;
        }

        if (senha.length < 6) {
          Alert.alert(
            'Senha incompatível',
            'Sua senha antiga possui menos de 6 caracteres. Cadastre uma nova conta com uma senha de pelo menos 6 caracteres.'
          );
          return;
        }

        credencial = await createUserWithEmailAndPassword(
          auth,
          emailNormalizado,
          senha
        );

        await updateProfile(credencial.user, {
          displayName: usuarioAntigo.nome,
        });
      }

      const usuario = await salvarUsuarioFirebase(
        credencial.user.uid,
        credencial.user.displayName || emailNormalizado.split('@')[0],
        credencial.user.email
      );

      if (!usuario) {
        throw new Error('Não foi possível recuperar os dados da conta.');
      }

      entrarNaConta(usuario);

    } catch (erro) {
      console.log('Erro ao realizar login:', erro);

      if (
        erro.code === 'auth/invalid-credential' ||
        erro.code === 'auth/wrong-password' ||
        erro.code === 'auth/user-not-found'
      ) {
        Alert.alert('Login inválido', 'E-mail ou senha incorretos.');
      } else if (erro.code === 'auth/too-many-requests') {
        Alert.alert(
          'Aguarde',
          'Muitas tentativas de login. Tente novamente mais tarde.'
        );
      } else {
        Alert.alert(
          'Erro',
          erro.message || 'Não foi possível realizar o login.'
        );
      }
    }
  }
  useEffect(() => {
    const usuarioFirebase = auth.currentUser;

    if (usuarioFirebase?.email) {
      setEmail(usuarioFirebase.email);
    }
  }, []);

  async function entrarComBiometria() {
    try {
      if (!contaBiometrica) {
        Alert.alert(
          'Biometria indisponível',
          'Esta conta não possui login biométrico ativado.'
        );
        return;
      }

      // A biometria só desbloqueia uma sessão Firebase já autenticada.
      if (
        !contaBiometrica.firebase_uid ||
        auth.currentUser?.uid !== contaBiometrica.firebase_uid
      ) {
        Alert.alert(
          'Entre com sua senha',
          'Faça primeiro um login com e-mail e senha nesta conta para utilizar a biometria.'
        );
        return;
      }

      const resultado =
        await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirme sua identidade',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: true,
        });

      if (!resultado.success) {
        Alert.alert(
          'Autenticação',
          'A autenticação biométrica não foi realizada.'
        );
        return;
      }

      entrarNaConta(contaBiometrica);

    } catch (erro) {
      console.log('Erro na biometria:', erro);

      Alert.alert(
        'Erro',
        'Não foi possível realizar a autenticação biométrica.'
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.faixaAzul} />
      <View style={styles.faixaAmarela} />

      <View style={styles.conteudo}>
        <Text style={styles.icone}>🚨</Text>

        <Text style={styles.titulo}>Ocorrências</Text>
        <Text style={styles.subtitulo}>Urbanas</Text>

        <Text style={styles.instrucao}>
          Entre no aplicativo
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#888"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.botao}
          onPress={entrar}
        >
          <Text style={styles.textoBotao}>Entrar</Text>
        </TouchableOpacity>

        {biometriaDisponivel && contaBiometrica && (
          <TouchableOpacity
            style={styles.botaoBiometria}
            onPress={entrarComBiometria}
          >
            <Text style={styles.iconeBiometria}>🔐</Text>

            <Text style={styles.textoBiometria}>
              Entrar com biometria
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={styles.cadastro}>
            Não possui uma conta? Cadastre-se
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
    height: 200,
    backgroundColor: '#1565C0',
    top: 20,
    left: -width * 0.75,
    transform: [{ rotate: '-42deg' }],
  },

  faixaAmarela: {
    position: 'absolute',
    width: width * 1.5,
    height: 25,
    backgroundColor: '#FFD600',
    top: 85,
    left: -width * 0.3,
    transform: [{ rotate: '-42deg' }],
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
    marginTop: 5,
  },

  textoBotao: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  botaoBiometria: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#1565C0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },

  iconeBiometria: {
    fontSize: 20,
    marginRight: 8,
  },

  textoBiometria: {
    color: '#1565C0',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cadastro: {
    marginTop: 22,
    color: '#1565C0',
    fontSize: 15,
  },
});
