import { View, Text, Button, StyleSheet } from 'react-native';

export default function NovaOcorrenciaScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        Nova ocorrência
      </Text>

      <Text style={styles.descricao}>
        Aqui vamos registrar um problema encontrado na cidade.
      </Text>

      <Button
        title="Voltar"
        onPress={() => navigation.goBack()}
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

});