import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        🚨 Ocorrências Urbanas
      </Text>

      <Text style={styles.descricao}>
        Registre problemas encontrados na cidade.
      </Text>

      <Button
        title="Nova ocorrência"
        onPress={() => navigation.navigate('NovaOcorrencia')}
      />

      <View style={styles.espaco} />

      <Button
        title="Minhas ocorrências"
        onPress={() => alert('Ainda vamos fazer essa tela!')}
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
    marginBottom: 20,
  },

  descricao: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },

  espaco: {
    height: 20,
  },

});