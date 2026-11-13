
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { listarOcorrencias } from '../database';
import { excluirOcorrencia } from '../sincronizacao';

export default function TodasOcorrenciasScreen({
  route,
  somenteMinhasForcada,
}) {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  const somenteMinhas =
    somenteMinhasForcada ?? route.params?.somenteMinhas ?? false;

  const usuarioId = route.params?.usuarioId;

  useFocusEffect(
    useCallback(() => {
      async function carregarOcorrencias() {
        try {
          setCarregando(true);

          const dados = await listarOcorrencias();

          setOcorrencias(
            somenteMinhas
              ? dados.filter(
                  (item) => item.usuario_id === usuarioId
                )
              : dados
          );
        } catch (erro) {
          console.log('Erro ao carregar ocorrências:', erro);
          Alert.alert('Erro', 'Não foi possível carregar as ocorrências.');
        } finally {
          setCarregando(false);
        }
      }

      carregarOcorrencias();
    }, [somenteMinhas, usuarioId])
  );
  
  function confirmarExclusao() {
    if (!ocorrenciaSelecionada || excluindo) return;

    Alert.alert(
      'Excluir ocorrência',
      'Tem certeza de que deseja excluir esta ocorrência? Essa ação não poderá ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setExcluindo(true);

              const resultado = await excluirOcorrencia(
                ocorrenciaSelecionada.id,
                usuarioId
              );

              setOcorrencias(atual =>
                atual.filter(
                  item => item.id !== ocorrenciaSelecionada.id
                )
              );

              setOcorrenciaSelecionada(null);

              if (resultado.pendenteNuvem) {
                Alert.alert(
                  'Exclusão registrada',
                  'A ocorrência foi removida da lista e será excluída da nuvem na próxima sincronização.'
                );
              } else {
                Alert.alert('Sucesso', 'Ocorrência excluída.');
              }

            } catch (erro) {
              console.log('Erro ao excluir ocorrência:', erro);

              Alert.alert(
                'Erro',
                erro.message || 'Não foi possível excluir a ocorrência.'
              );

            } finally {
              setExcluindo(false);
            }
          },
        },
      ]
    );
  }


  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>
          {somenteMinhas ? 'Minhas ocorrências' : 'Todas as ocorrências'}
        </Text>

        {carregando ? (
          <ActivityIndicator size="large" color="#1565C0" />
        ) : (
          <>
            <Text style={styles.subtitulo}>
              {ocorrencias.length === 0
                ? 'Nenhuma ocorrência registrada.'
                : 'Selecione uma ocorrência para ver os detalhes.'}
            </Text>

            {ocorrencias.map((ocorrencia) => (
              <TouchableOpacity
                key={ocorrencia.id}
                style={styles.ocorrencia}
                onPress={() => setOcorrenciaSelecionada(ocorrencia)}
              >
                <View style={styles.ocorrenciaInfo}>
                  <Text style={styles.descricao} numberOfLines={2}>
                    🚨 {ocorrencia.descricao}
                  </Text>

                  <Text style={styles.nivel}>
                    Nível: {ocorrencia.nivel}
                  </Text>

                  <Text style={styles.localizacao}>
                    📍 {Number(ocorrencia.latitude).toFixed(4)},{' '}
                    {Number(ocorrencia.longitude).toFixed(4)}
                  </Text>

                  {!somenteMinhas && (
                    <Text style={styles.localizacao}>
                      Usuário: {ocorrencia.usuarioNome}
                    </Text>
                  )}
                </View>

                {ocorrencia.foto && (
                  <Image
                    source={{ uri: ocorrencia.foto }}
                    style={styles.foto}
                  />
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <Modal
        visible={ocorrenciaSelecionada !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOcorrenciaSelecionada(null)}
      >
        <View style={styles.fundoModal}>
          <View style={styles.modal}>
            {ocorrenciaSelecionada && (
              <>
                <Text style={styles.modalTitulo}>
                  🚨 {ocorrenciaSelecionada.descricao}
                </Text>

                <Text style={styles.modalNivel}>
                  Nível: {ocorrenciaSelecionada.nivel}
                </Text>

                {ocorrenciaSelecionada.foto && (
                  <Image
                    source={{ uri: ocorrenciaSelecionada.foto }}
                    style={styles.fotoModal}
                  />
                )}

                <View style={styles.mapa}>
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.mapaInterno}
                    initialRegion={{
                      latitude: Number(ocorrenciaSelecionada.latitude),
                      longitude: Number(ocorrenciaSelecionada.longitude),
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: Number(ocorrenciaSelecionada.latitude),
                        longitude: Number(ocorrenciaSelecionada.longitude),
                      }}
                    />
                  </MapView>
                </View>

                <Text style={styles.localizacaoModal}>
                  📍 Localização da ocorrência
                </Text>

                <Text style={styles.coordenadas}>
                  Latitude: {Number(ocorrenciaSelecionada.latitude).toFixed(5)}
                  {'\n'}
                  Longitude: {Number(ocorrenciaSelecionada.longitude).toFixed(5)}
                </Text>

                {somenteMinhas && (
                  <TouchableOpacity
                    style={styles.botaoExcluir}
                    onPress={confirmarExclusao}
                    disabled={excluindo}
                  >
                    <Text style={styles.textoBotaoExcluir}>
                      {excluindo ? 'Excluindo...' : 'Excluir ocorrência'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.botaoFechar}
                  onPress={() => setOcorrenciaSelecionada(null)}
                >
                  <Text style={styles.textoBotaoFechar}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  ocorrencia: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ocorrenciaInfo: {
    flex: 1,
  },
  descricao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  nivel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  localizacao: {
    fontSize: 13,
    color: '#888',
    marginTop: 3,
  },
  foto: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginLeft: 10,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalNivel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  fotoModal: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 12,
  },
  mapa: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mapaInterno: {
    width: '100%',
    height: '100%',
  },
  localizacaoModal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  coordenadas: {
    fontSize: 13,
    color: '#777',
    marginBottom: 15,
  },
  botaoFechar: {
    height: 45,
    backgroundColor: '#1565C0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoFechar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  botaoExcluir: {
  height: 45,
  backgroundColor: '#D32F2F',
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
  },

  textoBotaoExcluir: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
