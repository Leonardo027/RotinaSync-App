// app/(tabs)/treino/criar.tsx

import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Treino, Exercicio, Serie } from '../../../constants/types';

export default function CriarTreinoScreen() {
  const [nomeTreino, setNomeTreino] = React.useState('');
  const [exercicios, setExercicios] = React.useState<Exercicio[]>([
    { nome: '', series: [{ reps: '', peso: '' }] },
  ]);
  const router = useRouter();

  const handleExercicioChange = (text: string, exIndex: number) => {
    const novosExercicios = [...exercicios];
    novosExercicios[exIndex].nome = text;
    setExercicios(novosExercicios);
  };

  const handleSerieChange = (text: string, exIndex: number, serieIndex: number, campo: 'reps' | 'peso') => {
    const novosExercicios = [...exercicios];
    novosExercicios[exIndex].series[serieIndex][campo] = text;
    setExercicios(novosExercicios);
  };

  const adicionarExercicio = () => {
    setExercicios([...exercicios, { nome: '', series: [{ reps: '', peso: '' }] }]);
  };

  const adicionarSerie = (exIndex: number) => {
    const novosExercicios = [...exercicios];
    novosExercicios[exIndex].series.push({ reps: '', peso: '' });
    setExercicios(novosExercicios);
  };

  const salvarTreino = async () => {
    if (!nomeTreino.trim()) {
      Alert.alert("Erro", "Por favor, dê um nome ao seu treino.");
      return;
    }
    // Verifica se todos os exercícios têm nome
    if (exercicios.some(ex => !ex.nome.trim())) {
      Alert.alert("Erro", "Por favor, preencha o nome de todos os exercícios.");
      return;
    }

    const novoTreino: Treino = {
      id: Date.now().toString(),
      nome: nomeTreino,
      exercicios: exercicios,
    };

    try {
      const treinosString = await AsyncStorage.getItem('treinos');
      const treinos: Treino[] = treinosString ? JSON.parse(treinosString) : [];
      treinos.push(novoTreino);
      await AsyncStorage.setItem('treinos', JSON.stringify(treinos));
      router.back();
    } catch (e) {
      console.error("Erro ao salvar o treino:", e);
      Alert.alert("Erro", "Não foi possível salvar o treino.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Criar Novo Treino</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Treino (ex: Treino de Peito)"
        value={nomeTreino}
        onChangeText={setNomeTreino}
      />

      {exercicios.map((exercicio, exIndex) => (
        <View key={exIndex} style={styles.exercicioContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Exercício ${exIndex + 1}`}
            value={exercicio.nome}
            onChangeText={(text) => handleExercicioChange(text, exIndex)}
          />
          {exercicio.series.map((serie, serieIndex) => (
            <View key={serieIndex} style={styles.serieContainer}>
              <Text style={styles.serieLabel}>Série {serieIndex + 1}</Text>
              <TextInput
                style={styles.serieInput}
                placeholder="Reps"
                value={serie.reps}
                onChangeText={(text) => handleSerieChange(text, exIndex, serieIndex, 'reps')}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.serieInput}
                placeholder="Peso (Kg)"
                value={serie.peso}
                onChangeText={(text) => handleSerieChange(text, exIndex, serieIndex, 'peso')}
                keyboardType="numeric"
              />
            </View>
          ))}
          <Button title="Adicionar Série" onPress={() => adicionarSerie(exIndex)} />
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <Button title="Adicionar Exercício" onPress={adicionarExercicio} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Salvar Treino" onPress={salvarTreino} color="#1DB954" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  exercicioContainer: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, marginBottom: 20 },
  serieContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  serieLabel: { fontSize: 16, marginRight: 10, },
  serieInput: { backgroundColor: 'white', padding: 10, borderRadius: 5, flex: 1, marginHorizontal: 5, fontSize: 16 },
  buttonContainer: { marginTop: 10, marginBottom: 20 },
});