
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { iniciarBanco } from './database';

import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
import HomeScreen from './screens/HomeScreen';
import NovaOcorrenciaScreen from './screens/NovaOcorrenciaScreen';
import TodasOcorrenciasScreen from './screens/TodasOcorrenciasScreen';
import PerfilScreen from './screens/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TextIcon({ emoji }) {
  return <Text style={{ fontSize: 19 }}>{emoji}</Text>;
}

function NavegacaoPrincipal({ route }) {
  const email = route.params?.email || '';
  const usuarioId = route.params?.usuarioId;

  const [nome, setNome] = useState(route.params?.nome || 'Usuário');
  const [fotoPerfil, setFotoPerfil] = useState(
    route.params?.foto_perfil || null
  );
  const [biometriaAtiva, setBiometriaAtiva] = useState(
    !!route.params?.biometria_ativa
  );

  const insets = useSafeAreaInsets();

  const criarPropsRota = (props) => ({
    ...props,
    route: {
      ...props.route,
      params: {
        ...props.route.params,
        nome,
        email,
        usuarioId,
        fotoPerfil,
        biometriaAtiva,
      },
    },
  });

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1565C0',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          height: 62 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
          backgroundColor: '#fff',
          borderTopColor: '#e5e5e5',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: 'Início',
          tabBarIcon: () => <TextIcon emoji="🏠" />,
        }}
      >
        {(props) => (
          <HomeScreen
            {...criarPropsRota(props)}
            nome={nome}
            email={email}
            usuarioId={usuarioId}
            fotoPerfil={fotoPerfil}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="NovaOcorrencia"
        options={{
          title: 'Registrar',
          tabBarIcon: () => <TextIcon emoji="➕" />,
        }}
      >
        {(props) => (
          <NovaOcorrenciaScreen {...criarPropsRota(props)} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="TodasOcorrencias"
        options={{
          title: 'Todas',
          tabBarIcon: () => <TextIcon emoji="📋" />,
        }}
      >
        {(props) => (
          <TodasOcorrenciasScreen
            {...criarPropsRota(props)}
            somenteMinhasForcada={false}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="MinhasOcorrencias"
        options={{
          title: 'Minhas',
          tabBarIcon: () => <TextIcon emoji="📝" />,
        }}
      >
        {(props) => (
          <TodasOcorrenciasScreen
            {...criarPropsRota(props)}
            somenteMinhasForcada={true}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: () => <TextIcon emoji="👤" />,
        }}
      >
        {(props) => (
          <PerfilScreen
            {...criarPropsRota(props)}
            nome={nome}
            email={email}
            usuarioId={usuarioId}
            fotoPerfil={fotoPerfil}
            setNome={setNome}
            setFotoPerfil={setFotoPerfil}
            biometriaAtiva={biometriaAtiva}
            setBiometriaAtiva={setBiometriaAtiva}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [bancoPronto, setBancoPronto] = useState(false);
  const [erroBanco, setErroBanco] = useState(false);

  useEffect(() => {
    async function prepararBanco() {
      try {
        await iniciarBanco();
        setBancoPronto(true);
      } catch (erro) {
        console.log('Erro ao iniciar banco:', erro);
        setErroBanco(true);
      }
    }

    prepararBanco();
  }, []);

  if (!bancoPronto) {
    return (
      <View style={styles.carregando}>
        {erroBanco ? (
          <Text>Erro ao iniciar o banco de dados.</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color="#1565C0" />
            <Text style={styles.textoCarregando}>
              Preparando aplicativo...
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Principal"
          component={NavegacaoPrincipal}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  textoCarregando: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
});
