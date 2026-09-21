import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function FaixasDecorativas() {
  return (
    <>
      {/* FAIXA AZUL */}
      <View style={styles.faixaAzul} />
      {/* FAIXA AMARELA */}
      <View style={styles.faixaAmarela} />
    </>
  );
}


const styles = StyleSheet.create({

  faixaAzul: {
    position: 'absolute',
    top: -height * 0.58,
    right: width * 0.30,
    width: width * 1.01,
    height: height * 1.3,
    backgroundColor: '#1565C0',
    transform: [
      {
        rotate: '50deg',
      },
    ],
  },


  faixaAmarela: {
    position: 'absolute',
    top: -height * 0.32,
    right: width * 0.48,
    width: 30,
    height: height * 1.25,
    backgroundColor: '#FBC02D',
    transform: [
      {
        rotate: '50deg',
      },
    ],
  },

});