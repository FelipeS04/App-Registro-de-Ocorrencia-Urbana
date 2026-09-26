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

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');

const CHAVE_USUARIO = '@ocorrencias_usuario';

export default function LoginScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');

  const [biometriaDisponivel, setBiometriaDisponivel] =
    useState(false);

  const [usuarioCadastrado, setUsuarioCadastrado] =
    useState(false);

  // Verifica se existe usuário salvo
  useEffect(() => {
    verificarUsuario();
    verificarBiometria();
  }, []);

  async function verificarUsuario() {
    try {
      const usuarioSalvo =
        await AsyncStorage.getItem(CHAVE_USUARIO);

      if (usuarioSalvo) {
        setUsuarioCadastrado(true);

        const usuario = JSON.parse(usuarioSalvo);

        // Preenche automaticamente o nome
        setNome(usuario.nome);
      }
    } catch (erro) {
      console.log('Erro ao verificar usuário:', erro);
    }
  }

  // Verifica biometria
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
      console.log(
        'Erro ao verificar biometria:',
        erro
      );
    }
  }

  // Login com nome e senha
  async function entrar() {
    if (nome.trim() === '') {
      Alert.alert(
        'Atenção',
        'Digite seu nome.'
      );
      return;
    }

    if (senha === '') {
      Alert.alert(
        'Atenção',
        'Digite sua senha.'
      );
      return;
    }

    try {
      const usuarioSalvo =
        await AsyncStorage.getItem(CHAVE_USUARIO);

      // Não existe cadastro
      if (!usuarioSalvo) {
        Alert.alert(
          'Nenhuma conta encontrada',
          'Faça seu cadastro primeiro.'
        );

        return;
      }

      const usuario = JSON.parse(usuarioSalvo);

      // Verifica nome
      if (
        nome.trim().toLowerCase() !==
        usuario.nome.toLowerCase()
      ) {
        Alert.alert(
          'Login inválido',
          'Nome ou senha incorretos.'
        );

        return;
      }

      // Verifica senha
      if (senha !== usuario.senha) {
        Alert.alert(
          'Login inválido',
          'Nome ou senha incorretos.'
        );

        return;
      }

      // Login correto
      navigation.replace('Home', {
        nome: usuario.nome,
        email: usuario.email,
      });

    } catch (erro) {
      console.log(
        'Erro ao realizar login:',
        erro
      );

      Alert.alert(
        'Erro',
        'Não foi possível realizar o login.'
      );
    }
  }

  // Login com biometria
  async function entrarComBiometria() {
    if (!biometriaDisponivel) {
      Alert.alert(
        'Biometria indisponível',
        'Este dispositivo não possui biometria configurada.'
      );

      return;
    }

    try {
      const usuarioSalvo =
        await AsyncStorage.getItem(CHAVE_USUARIO);

      if (!usuarioSalvo) {
        Alert.alert(
          'Nenhuma conta encontrada',
          'Faça seu cadastro primeiro.'
        );

        return;
      }

      const usuario = JSON.parse(usuarioSalvo);

      const resultado =
        await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirme sua identidade',
          cancelLabel: 'Cancelar',
        });

      if (resultado.success) {
        navigation.replace('Home', {
          nome: usuario.nome,
          email: usuario.email,
        });
      } else {
        Alert.alert(
          'Autenticação',
          'Autenticação não realizada.'
        );
      }

    } catch (erro) {
      console.log(
        'Erro na biometria:',
        erro
      );

      Alert.alert(
        'Erro',
        'Não foi possível realizar a autenticação.'
      );
    }
  }

  return (
    <View style={styles.container}>

      {/* FAIXAS */}
      <View style={styles.faixaAzul} />
      <View style={styles.faixaAmarela} />

      <View style={styles.conteudo}>

        <Text style={styles.icone}>
          🚨
        </Text>

        <Text style={styles.titulo}>
          Ocorrências
        </Text>

        <Text style={styles.subtitulo}>
          Urbanas
        </Text>

        <Text style={styles.instrucao}>
          Entre no aplicativo
        </Text>

        {/* NOME */}
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#888"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />

        {/* SENHA */}
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#888"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {/* ENTRAR */}
        <TouchableOpacity
          style={styles.botao}
          onPress={entrar}
        >
          <Text style={styles.textoBotao}>
            Entrar
          </Text>
        </TouchableOpacity>

        {/* BIOMETRIA */}
        {biometriaDisponivel && usuarioCadastrado && (
          <TouchableOpacity
            style={styles.botaoBiometria}
            onPress={entrarComBiometria}
          >
            <Text style={styles.iconeBiometria}>
              🔐
            </Text>

            <Text style={styles.textoBiometria}>
              Entrar com biometria
            </Text>
          </TouchableOpacity>
        )}

        {/* CADASTRO */}
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
    transform: [
      {
        rotate: '-42deg',
      },
    ],
  },

  faixaAzul2: {
    position: 'absolute',
    width: width * 1.5,
    height: 200,
    backgroundColor: '#1565C0',
    top: -20,
    left: -width * 0.75,
    transform: [
      {
        rotate: '-2deg',
      },
    ],
  },

  faixaAmarela: {
    position: 'absolute',
    width: width * 1.5,
    height: 25,
    backgroundColor: '#FFD600',
    top: 85,
    left: -width * 0.3,
    transform: [
      {
        rotate: '-42deg',
      },
    ],
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