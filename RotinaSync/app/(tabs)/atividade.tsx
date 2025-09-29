// app/(tabs)/atividade.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Um nome único para a "caixinha" que guardará todos os dados desta tela
const CHAVE_STORAGE_ATIVIDADE = '@RotinaSync:atividadeDados';

// Interface para organizar os dados que vamos salvar
interface AtividadeDados {
  horaDormir: string;
  horaAcordar: string;
  tempoCardio: string;
  distanciaCardio: string;
}

export default function TabAtividadeScreen() {
  const [horaDormir, setHoraDormir] = useState('');
  const [horaAcordar, setHoraAcordar] = useState('');
  const [tempoCardio, setTempoCardio] = useState('');
  const [distanciaCardio, setDistanciaCardio] = useState('');
  const [carregando, setCarregando] = useState(true);

  // --- GATILHO 1: CARREGAR DADOS ---
  useEffect(() => {
    async function carregarDados() {
      try {
        const dadosSalvos = await AsyncStorage.getItem(CHAVE_STORAGE_ATIVIDADE);
        if (dadosSalvos !== null) {
          const dados: AtividadeDados = JSON.parse(dadosSalvos);
          setHoraDormir(dados.horaDormir || '');
          setHoraAcordar(dados.horaAcordar || '');
          setTempoCardio(dados.tempoCardio || '');
          setDistanciaCardio(dados.distanciaCardio || '');
        }
      } catch (error) {
        console.error("Erro ao carregar dados da atividade", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // --- GATILHO 2: SALVAR DADOS ---
  useEffect(() => {
    async function salvarDados() {
      if (!carregando) {
        try {
          const dados: AtividadeDados = {
            horaDormir,
            horaAcordar,
            tempoCardio,
            distanciaCardio,
          };
          await AsyncStorage.setItem(CHAVE_STORAGE_ATIVIDADE, JSON.stringify(dados));
        } catch (error) {
          console.error("Erro ao salvar dados da atividade", error);
        }
      }
    }
    salvarDados();
  }, [horaDormir, horaAcordar, tempoCardio, distanciaCardio, carregando]);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d68400" />
        <Text>Carregando registros...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <Text style={styles.titulo}>Atividades do Dia</Text>

        {/* Seção de Sono */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>🌙 Monitoramento de Sono</Text>
          <Text style={styles.label}>Hora que dormiu:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 23:00"
            value={horaDormir}
            onChangeText={setHoraDormir}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>Hora que acordou:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 07:00"
            value={horaAcordar}
            onChangeText={setHoraAcordar}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Seção de Cardio */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>🏃 Registro de Cardio</Text>
          <Text style={styles.label}>Tempo Gasto:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 30 min"
            value={tempoCardio}
            onChangeText={setTempoCardio}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>Distância Percorrida (km):</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 5.5"
            value={distanciaCardio}
            onChangeText={setDistanciaCardio}
            keyboardType="decimal-pad"
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (estilos existentes)
  container: { flex: 1, backgroundColor: '#fff9f0' },
  content: { padding: 20, flexGrow: 1 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 30 },
  secao: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 25, borderColor: '#eee', borderWidth: 1 },
  secaoTitulo: { fontSize: 20, fontWeight: 'bold', color: '#d68400', marginBottom: 20 },
  label: { fontSize: 16, color: '#555', marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 15 },
  // Novo estilo
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff9f0',
  },
});