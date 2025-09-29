// app/(tabs)/treino/executar.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Treino, HistoricoItem, Serie } from '../../../constants/types';
import Checkbox from 'expo-checkbox';
import { getGenresForPeriod } from '../../../services/spotify';
import Toast from 'react-native-toast-message'; // <-- IMPORTAR O TOAST

// ... (todo o resto do seu ficheiro - useState, useEffect, etc. - continua igual)

export default function ExecutarTreinoScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { treinoId } = params;

  const [treino, setTreino] = useState<Treino | null>(null);
  const [logSeries, setLogSeries] = useState<LogSeries>({});
  
  const startTime = useRef(new Date());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [duracao, setDuracao] = useState(0);

  useEffect(() => { /* ...código igual, sem alterações... */ }, [treinoId]);

  // --- FUNÇÃO FINALIZAR TREINO ATUALIZADA ---
  const finalizarTreino = async () => {
    if (!treino) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const endTime = new Date();

    Alert.alert("Finalizar Treino", "Tem a certeza?",
      [{ text: "Cancelar", style: "cancel" }, { text: "Finalizar", onPress: async () => {
        try {
          const generosDoTreino = await getGenresForPeriod(startTime.current, endTime);
          
          const historicoString = await AsyncStorage.getItem('historicoTreinos');
          const historico: HistoricoItem[] = historicoString ? JSON.parse(historicoString) : [];

          const novoHistoricoItem: HistoricoItem = {
            id: Date.now().toString(),
            nomeTreino: treino.nome,
            data: new Date().toISOString(),
            duracao: duracao,
            exercicios: treino.exercicios.map((ex, exIndex) => ({
              nome: ex.nome,
              series: ex.series.map((_, serieIndex) => logSeries[exIndex][serieIndex]),
            })),
            generos: generosDoTreino,
          };

          historico.unshift(novoHistoricoItem);
          await AsyncStorage.setItem('historicoTreinos', JSON.stringify(historico));

          // --- MOSTRAR O TOAST DE SUCESSO! ---
          Toast.show({
            type: 'success', // 'success', 'error', 'info'
            text1: 'Sucesso!',
            text2: 'O seu treino foi guardado no histórico.',
          });

          router.replace('/(tabs)/treino/historico');

        } catch (e) { 
          console.error("Erro ao guardar o histórico:", e);
          Alert.alert("Erro", "Não foi possível guardar o seu treino.");
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível guardar o seu treino.',
          });
        }
      }}
    ]);
  };
  
  // ... (o resto do ficheiro - useEffects, handleLogChange, handleCheck, formatarDuracao e o JSX - continua igual)
  const carregarTreino = async () => { if (typeof treinoId === 'string') { const treinosString = await AsyncStorage.getItem('treinos'); const treinos: Treino[] = treinosString ? JSON.parse(treinosString) : []; const treinoAtual = treinos.find(t => t.id === treinoId); if (treinoAtual) { setTreino(treinoAtual); const logInicial: LogSeries = {}; treinoAtual.exercicios.forEach((ex, exIndex) => { logInicial[exIndex] = {}; ex.series.forEach((serie, serieIndex) => { logInicial[exIndex][serieIndex] = { ...serie, concluida: false }; }); }); setLogSeries(logInicial); } } };
  useEffect(() => { carregarTreino(); startTime.current = new Date(); timerRef.current = setInterval(() => { setDuracao(prev => prev + 1); }, 1000); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [treinoId]);
  const handleLogChange = (exIndex: number, serieIndex: number, campo: 'reps' | 'peso', valor: string) => { setLogSeries(prev => ({ ...prev, [exIndex]: { ...prev[exIndex], [serieIndex]: { ...prev[exIndex][serieIndex], [campo]: valor }, }, })); };
  const handleCheck = (exIndex: number, serieIndex: number) => { setLogSeries(prev => ({ ...prev, [exIndex]: { ...prev[exIndex], [serieIndex]: { ...prev[exIndex][serieIndex], concluida: !prev[exIndex][serieIndex].concluida }, }, })); };
  const formatarDuracao = (s: number) => { return new Date(s * 1000).toISOString().substr(11, 8); };
  if (!treino) { return <View style={styles.container}><Text>A carregar treino...</Text></View>; }
  return ( <ScrollView style={styles.container}> <View style={styles.header}> <Text style={styles.title}>{treino.nome}</Text> <Text style={styles.timer}>{formatarDuracao(duracao)}</Text> </View> {treino.exercicios.map((exercicio, exIndex) => ( <View key={exIndex} style={styles.exercicioContainer}> <Text style={styles.exercicioNome}>{exercicio.nome}</Text> {exercicio.series.map((serie, serieIndex) => ( <View key={serieIndex} style={styles.serieContainer}> <Checkbox style={styles.checkbox} value={logSeries[exIndex]?.[serieIndex]?.concluida || false} onValueChange={() => handleCheck(exIndex, serieIndex)} /> <Text style={styles.serieMeta}>{`Meta: ${serie.reps} reps, ${serie.peso} Kg`}</Text> <TextInput style={styles.input} placeholder="Reps feitos" keyboardType="numeric" value={logSeries[exIndex]?.[serieIndex]?.reps || ''} onChangeText={(text) => handleLogChange(exIndex, serieIndex, 'reps', text)} /> <TextInput style={styles.input} placeholder="Peso usado" keyboardType="numeric" value={logSeries[exIndex]?.[serieIndex]?.peso || ''} onChangeText={(text) => handleLogChange(exIndex, serieIndex, 'peso', text)} /> </View> ))} </View> ))} <Button title="Finalizar Treino" onPress={finalizarTreino} color="#e63946" /> </ScrollView> );
}

type LogSeries = { [exIndex: number]: { [serieIndex: number]: { reps: string; peso: string; concluida: boolean }; }; };
const styles = StyleSheet.create({ container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' }, header: { marginBottom: 20, alignItems: 'center' }, title: { fontSize: 24, fontWeight: 'bold' }, timer: { fontSize: 20, marginTop: 10, color: '#457b9d' }, exercicioContainer: { marginBottom: 20, backgroundColor: 'white', borderRadius: 8, padding: 15 }, exercicioNome: { fontSize: 18, fontWeight: '600', marginBottom: 10 }, serieContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, flexWrap: 'wrap' }, checkbox: { marginRight: 10 }, serieMeta: { flexBasis: '100%', fontSize: 14, color: 'gray', marginBottom: 5 }, input: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 5, flex: 1, marginHorizontal: 5, fontSize: 16, minWidth: 100, }, });