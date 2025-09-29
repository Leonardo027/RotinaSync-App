// app/(tabs)/treino/index.tsx

import React from 'react';
import { View, Text, FlatList, StyleSheet, Button, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Treino } from '../../../constants/types';
import { FontAwesome } from '@expo/vector-icons';

function useTreinos() {
  const [treinos, setTreinos] = React.useState<Treino[]>([]);
  useFocusEffect(
    React.useCallback(() => {
      const carregarTreinos = async () => {
        const treinosString = await AsyncStorage.getItem('treinos');
        setTreinos(treinosString ? JSON.parse(treinosString) : []);
      };
      carregarTreinos();
    }, [])
  );
  return treinos;
}

export default function TreinoScreen() {
  const treinos = useTreinos();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Treinos</Text>
        {/* --- BOTÃO PARA O HISTÓRICO --- */}
        <Button title="Ver Histórico" onPress={() => router.push('/(tabs)/treino/historico')} />
      </View>
      <FlatList
        data={treinos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Crie o seu primeiro treino!</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.treinoItem} onPress={() => router.push({ pathname: '/(tabs)/treino/executar', params: { treinoId: item.id } })}>
            <Text style={styles.treinoNome}>{item.nome}</Text>
            <FontAwesome name="play-circle" size={24} color="#457b9d" />
          </Pressable>
        )}
      />
      <Button title="Criar Novo Treino" onPress={() => router.push('/(tabs)/treino/criar')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  treinoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 8, marginBottom: 10, elevation: 2 },
  treinoNome: { fontSize: 18 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
});