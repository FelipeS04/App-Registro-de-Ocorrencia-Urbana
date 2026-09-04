import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet
} from 'react-native';

export default function LoginScreen({ navigation }) {

  const [nome, setNome] = useState('');

  function entrar() {

    if (nome.trim() === '') {
      alert('Digite seu nome.');
      return;
    }

    navigation.navigate('Home', {
      nome: nome
    });
  }

  function entrarComoConvidado() {

    navigation.navigate('Home', {
      nome: 'Convidado'
    });
  }

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        🚨 Ocorrências Urbanas
      </Text>

      <Text style={styles.subtitulo}>
        Entre para registrar ocorrências
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu nome"
        value={nome}
        onChangeText={setNome}
      />

      <Button
        title="Entrar"
        onPress={entrar}
      />

      <View style={styles.espaco} />

      <Button
        title="Continuar como convidado"
        onPress={entrarComoConvidado}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },

  espaco: {
    height: 20,
  },

});