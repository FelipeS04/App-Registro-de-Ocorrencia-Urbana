import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
import HomeScreen from './screens/HomeScreen';
import NovaOcorrenciaScreen from './screens/NovaOcorrenciaScreen';
import TodasOcorrenciasScreen from './screens/TodasOcorrenciasScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [ocorrencias, setOcorrencias] = React.useState([]);

  function adicionarOcorrencia(novaOcorrencia) {
    setOcorrencias((anteriores) => [
      ...anteriores,
      novaOcorrencia,
    ]);
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        {/* LOGIN */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* CADASTRO */}
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{ headerShown: false }}
        />

        {/* HOME */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Ocorrências Urbanas' }}
        />

        {/* TODAS AS OCORRÊNCIAS */}
        <Stack.Screen
          name="TodasOcorrencias"
          options={{ title: 'Todas as ocorrências' }}
        >
          {(props) => (
            <TodasOcorrenciasScreen
              {...props}
              ocorrencias={ocorrencias}
            />
          )}
        </Stack.Screen>

        {/* NOVA OCORRÊNCIA */}
        <Stack.Screen
          name="NovaOcorrencia"
          options={{ title: 'Nova ocorrência' }}
        >
          {(props) => (
            <NovaOcorrenciaScreen
              {...props}
              adicionarOcorrencia={adicionarOcorrencia}
            />
          )}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}