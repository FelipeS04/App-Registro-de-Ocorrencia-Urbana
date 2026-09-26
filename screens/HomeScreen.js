import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import FaixasDecorativas from '../components/FaixasDecorativas';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation, route }) {
  const nome = route.params?.nome || 'Convidado';
  const fotoUsuario = route.params?.foto || require('../assets/use.png');
  const [menuAberto, setMenuAberto] = useState(false);
  const animacao = useRef(new Animated.Value(-width * 0.7)).current;

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

  return (
    <SafeAreaView style={styles.safe}>
      <FaixasDecorativas />

      {/* Header: foto + nome no topo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={abrirMenu} style={styles.avatarArea}>
          <Image source={fotoUsuario} style={styles.avatar} />
          <Text style={styles.usuario}>{nome}</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.container}>
        <Text style={styles.titulo}>🚨 Ocorrências Urbanas</Text>
        <Text style={styles.descricao}>O que você deseja fazer?</Text>

        <Button
          title="Nova ocorrência"
          onPress={() => navigation.navigate('NovaOcorrencia')}
        />

        <View style={styles.espaco} />

        <Button
          title="Todas as ocorrências"
          onPress={() => navigation.navigate('TodasOcorrencias')}
        />
      </View>

      {/* Overlay escuro quando o menu está aberto */}
      {menuAberto && (
        <Pressable style={styles.overlay} onPress={fecharMenu} />
      )}

      {/* Menu lateral (drawer) */}
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

        <TouchableOpacity style={styles.itemMenu} onPress={() => {
          fecharMenu();
          // navigation.navigate('Perfil');
        }}>
          <Text style={styles.textoItem}>👤 Meu Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemMenu} onPress={() => {
          fecharMenu();

        }}>
          <Text style={styles.textoItem}>⚙️ Configurações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemMenu} onPress={() => {
          fecharMenu();

        }}>
          <Text style={styles.textoItem}>ℹ️ Sobre o App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.itemMenu, styles.sair]} onPress={() => {navigation.replace('Login')}}>
          <Text style={[styles.textoItem, { color: '#e63946' }]}>Sair</Text>
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

  espaco: {
    height: 20,
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
});