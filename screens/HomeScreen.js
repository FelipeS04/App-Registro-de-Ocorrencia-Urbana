
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import FaixasDecorativas from '../components/FaixasDecorativas';
import { listarOcorrencias } from '../database';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation, route }) {
  const nome = route.params?.nome || 'Convidado';
  const email = route.params?.email || '';
  const fotoUsuario = route.params?.foto || require('../assets/use.png');

  const [ocorrencias, setOcorrencias] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);

  const animacao = useRef(new Animated.Value(-width * 0.7)).current;

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

  const abrirMenu = () => {
    setMenuAberto(true);

    Animated.timing(animacao, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const fecharMenu = () => {
    Animated.timing(animacao, {
      toValue: -width * 0.7,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setMenuAberto(false));
  };

  function sair() {
    navigation.getParent()?.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FaixasDecorativas />

      <View style={styles.header}>
        <TouchableOpacity onPress={abrirMenu} style={styles.avatarArea}>
          <Image source={fotoUsuario} style={styles.avatar} />
          <Text style={styles.usuario}>{nome}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.titulo}>
          🚨 Ocorrências Urbanas
        </Text>

        <Text style={styles.descricao}>
          O que você deseja fazer?
        </Text>

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

      {menuAberto && (
        <Pressable
          style={styles.overlay}
          onPress={fecharMenu}
        />
      )}

      <Animated.View
        style={[
          styles.menuLateral,
          { transform: [{ translateX: animacao }] },
        ]}
      >
        <View style={styles.menuHeader}>
          <Image source={fotoUsuario} style={styles.avatarGrande} />
          <Text style={styles.nomeMenu}>{nome}</Text>
        </View>

        <TouchableOpacity
          style={styles.itemMenu}
          onPress={() => {
            fecharMenu();
            navigation.navigate('Perfil');
          }}
        >
          <Text style={styles.textoItem}>👤 Meu Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.itemMenu}
          onPress={fecharMenu}
        >
          <Text style={styles.textoItem}>⚙️ Configurações</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.itemMenu}
          onPress={fecharMenu}
        >
          <Text style={styles.textoItem}>ℹ️ Sobre o App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.itemMenu, styles.sair]}
          onPress={sair}
        >
          <Text style={[styles.textoItem, { color: '#e63946' }]}>
            Sair
          </Text>
        </TouchableOpacity>
      </Animated.View>
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

  menuLateral: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.7,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    paddingTop: 50,
    zIndex: 20,
  },

  menuHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  avatarGrande: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#00aeff',
    marginBottom: 12,
  },

  nomeMenu: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },

  itemMenu: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  textoItem: {
    fontSize: 16,
    color: '#333',
  },

  sair: {
    marginTop: 20,
    borderBottomWidth: 0,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 15,
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
