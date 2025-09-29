// app/(tabs)/nutricao.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_STORAGE_NUTRICAO = '@RotinaSync:nutricaoDados';

interface NutricaoDados {
  cafeDaManha: string;
  almoco: string;
  jantar: string;
  lanches: string;
}

export default function TabNutricaoScreen() {
  const [dadosNutricao, setDadosNutricao] = useState<NutricaoDados>({
    cafeDaManha: '',
    almoco: '',
    jantar: '',
    lanches: '',
  });
  const [carregando, setCarregando] = useState(true);

  // --- GATILHO PARA CARREGAR DADOS ---
  useEffect(() => {
    async function carregarDados() {
      try {
        const dadosSalvos = await AsyncStorage.getItem(CHAVE_STORAGE_NUTRICAO);
        if (dadosSalvos !== null) {
          setDadosNutricao(JSON.parse(dadosSalvos));
        }
      } catch (error) {
        console.error("Erro ao carregar dados de nutrição", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // --- GATILHO PARA SALVAR DADOS ---
  useEffect(() => {
    async function salvarDados() {
      if (!carregando) {
        try {
          await AsyncStorage.setItem(CHAVE_STORAGE_NUTRICAO, JSON.stringify(dadosNutricao));
        } catch (error) {
          console.error("Erro ao salvar dados de nutrição", error);
        }
      }
    }
    salvarDados();
  }, [dadosNutricao, carregando]);

  // Função para atualizar o estado de forma organizada
  const handleTextChange = (refeicao: keyof NutricaoDados, texto: string) => {
    setDadosNutricao(dadosAnteriores => ({
      ...dadosAnteriores,
      [refeicao]: texto,
    }));
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>A carregar diário...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <Text style={styles.titulo}>Diário Alimentar</Text>

        {/* Secção Café da Manhã */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>☕ Café da Manhã</Text>
          <TextInput
            style={styles.input}
            placeholder="O que comeu ao café da manhã?"
            multiline
            value={dadosNutricao.cafeDaManha}
            onChangeText={(texto) => handleTextChange('cafeDaManha', texto)}
          />
        </View>

        {/* Secção Almoço */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>🍝 Almoço</Text>
          <TextInput
            style={styles.input}
            placeholder="O que comeu ao almoço?"
            multiline
            value={dadosNutricao.almoco}
            onChangeText={(texto) => handleTextChange('almoco', texto)}
          />
        </View>

        {/* Secção Jantar */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>🍲 Jantar</Text>
          <TextInput
            style={styles.input}
            placeholder="O que comeu ao jantar?"
            multiline
            value={dadosNutricao.jantar}
            onChangeText={(texto) => handleTextChange('jantar', texto)}
          />
        </View>

        {/* Secção Lanches */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>🍎 Lanches</Text>
          <TextInput
            style={styles.input}
            placeholder="Anotações sobre lanches ou outras refeições..."
            multiline
            value={dadosNutricao.lanches}
            onChangeText={(texto) => handleTextChange('lanches', texto)}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8e9', // Verde bem clarinho
  },
  content: {
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  secao: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  secaoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#388e3c', // Verde escuro
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100, // Altura mínima para anotações
    textAlignVertical: 'top', // Começa a escrever do topo
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f8e9',
  },
});