import React from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';

import MapView, {
  Marker,
} from 'react-native-maps';


export default function TodasOcorrenciasScreen({
  ocorrencias,
}) {

  return (

    <View style={styles.container}>

      <MapView
        style={styles.mapa}

        initialRegion={{
          latitude: -23.5505,
          longitude: -46.6333,

          // Mais aproximado da cidade
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}

        mapType="standard"
      >

        {ocorrencias.map((ocorrencia) => (

          <Marker
            key={ocorrencia.id}

            coordinate={{
              latitude: ocorrencia.latitude,
              longitude: ocorrencia.longitude,
            }}

            title={ocorrencia.nivel}
            description={ocorrencia.descricao}
          />

        ))}

      </MapView>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  mapa: {
    flex: 1,
  },

});