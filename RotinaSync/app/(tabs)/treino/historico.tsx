// app/(tabs)/treino/historico.tsx

import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoricoItem } from '../../../constants/types';

function useHistoricoData() {
  const [historico, setHistorico] = React.useState<HistoricoItem[]>([]);
  useFocusEffect(
    React.useCallback(() => {
      const carregar = async () => {
        try {
          const historicoString = await AsyncStorage.getItem('historicoTreinos');
          setHistorico(historicoString ? JSON.parse(historicoString) : []);
        } catch (e) {
          console.error("Erro ao carregar histórico", e);
        }
      };
      carregar();
    }, [])
  );
  return historico;
}

const formatarDuracao = (totalSegundos: number) => {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
};

export default function HistoricoScreen() {
  const historico = useHistoricoData();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Treinos</Text>
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Ainda não há treinos no seu histórico.</Text>}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.nomeTreino}</Text>
            <Text>Data: {new Date(item.data).toLocaleDateString()}</Text>
            <Text>Duração: {formatarDuracao(item.duracao)}</Text>
            
            {/* A nossa futura secção de géneros */}
            {item.generos && item.generos.length > 0 && (
              <View style={styles.genresContainer}>
                <Text style={styles.genresTitle}>Géneros Ouvidos:</Text>
                <View style={styles.genresList}>
                  {item.generos.map(genre => (
                    <View key={genre} style={styles.genreTag}>
                      <Text style={styles.genreText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  itemContainer: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  itemTitle: { fontSize: 18, fontWeight: 'bold' },
  genresContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  genresTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#1DB954',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 4,
    marginLeft: 0,
  },
  genreText: {
    color: 'white',
    fontSize: 12,
  },
});