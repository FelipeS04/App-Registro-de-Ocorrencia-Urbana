
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import FaixasDecorativas from '../components/FaixasDecorativas';
import { listarOcorrencias } from '../database';

export default function HomeScreen({ navigation, route }) {
  const nome = route.params?.nome || 'Convidado';
  const fotoUsuario = route.params?.foto || require('../assets/use.png');

  const [ocorrencias, setOcorrencias] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function carregarOcorrencias() {
        try {
          const dados = await listarOcorrencias();
          setOcorrencias(dados.slice(0, 3));
        } catch (erro) {
          console.log('Erro ao carregar ocorrências recentes:', erro);
        }
      }

      carregarOcorrencias();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FaixasDecorativas />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.avatarArea}>
          <Image source={fotoUsuario} style={styles.avatar} />
          <Text style={styles.usuario}>{nome}</Text>
        </View>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.container}>
        <Text style={styles.titulo}>
          🚨 Ocorrências Urbanas
        </Text>

        <Text style={styles.descricao}>
          O que você deseja fazer?
        </Text>

        {/* Últimas ocorrências */}
        <Text style={styles.tituloUltimas}>
          Últimas ocorrências
        </Text>

        <View style={styles.caixaOcorrencias}>
          {ocorrencias.length === 0 ? (
            <Text style={styles.semOcorrencias}>
              Nenhuma ocorrência registrada.
            </Text>
          ) : (
            ocorrencias.map((ocorrencia) => (
              <View
                key={ocorrencia.id}
                style={styles.ocorrenciaItem}
              >
                <View style={styles.ocorrenciaTexto}>
                  <Text
                    style={styles.descricaoOcorrencia}
                    numberOfLines={1}
                  >
                    🚨 {ocorrencia.descricao}
                  </Text>

                  <Text style={styles.nivelOcorrencia}>
                    Nível: {ocorrencia.nivel}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Botões de navegação */}
        <TouchableOpacity
          style={styles.botaoHome}
          onPress={() => navigation.navigate('NovaOcorrencia')}
        >
          <Text style={styles.textoBotaoHome}>
            Nova ocorrência
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoHome}
          onPress={() => navigation.navigate('TodasOcorrencias')}
        >
          <Text style={styles.textoBotaoHome}>
            Todas as ocorrências
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoMinhas}
          onPress={() => navigation.navigate('MinhasOcorrencias')}
        >
          <Text style={styles.textoBotaoMinhas}>
            Minhas ocorrências
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 10,
  },

  avatarArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#0fb3ff',
    marginRight: 10,
  },

  usuario: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 80,
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

  tituloUltimas: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },

  caixaOcorrencias: {
    width: '100%',
    height: 150,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 25,
    overflow: 'hidden',
  },

  ocorrenciaItem: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  ocorrenciaTexto: {
    flexDirection: 'column',
  },

  descricaoOcorrencia: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  nivelOcorrencia: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },

  semOcorrencias: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#888',
    fontSize: 14,
  },

  botaoHome: {
    width: '100%',
    height: 50,
    backgroundColor: '#1565C0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  textoBotaoHome: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  botaoMinhas: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1565C0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  textoBotaoMinhas: {
    color: '#1565C0',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
