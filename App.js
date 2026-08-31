import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import NovaOcorrenciaScreen from './screens/NovaOcorrenciaScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>

      <Stack.Navigator>

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Ocorrências Urbanas',
          }}
        />

        <Stack.Screen
          name="NovaOcorrencia"
          component={NovaOcorrenciaScreen}
          options={{
            title: 'Nova ocorrência',
          }}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}