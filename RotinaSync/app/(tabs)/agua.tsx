// app/(tabs)/agua.tsx

// Importamos useEffect e ActivityIndicator
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, TextInput, Button, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// Importamos nossa ferramenta de memória
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nomes únicos para nossas "caixinhas" de dados da água
const CHAVE_AGUA = '@RotinaSync:aguaConsumida';
const CHAVE_META = '@RotinaSync:metaAgua';

export default function TabAguaScreen() {
  const [metaAgua, setMetaAgua] = useState(3000);
  const [tempMetaInput, setTempMetaInput] = useState('3000');
  const [aguaConsumida, setAguaConsumida] = useState(0);
  // Novo estado para o loading
  const [carregando, setCarregando] = useState(true);

  // --- GATILHO 1: CARREGAR DADOS (Executa uma única vez) ---
  useEffect(() => {
    async function carregarDados() {
      try {
        const aguaSalva = await AsyncStorage.getItem(CHAVE_AGUA);
        const metaSalva = await AsyncStorage.getItem(CHAVE_META);

        if (aguaSalva !== null) {
          setAguaConsumida(JSON.parse(aguaSalva));
        }
        if (metaSalva !== null) {
          const metaNumerica = JSON.parse(metaSalva);
          setMetaAgua(metaNumerica);
          setTempMetaInput(metaNumerica.toString()); // Atualizamos o campo de texto também
        }
      } catch (error) {
        console.error("Erro ao carregar dados da água", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // --- GATILHO 2: SALVAR DADOS (Executa sempre que os valores mudam) ---
  useEffect(() => {
    async function salvarDados() {
      if (!carregando) {
        try {
          await AsyncStorage.setItem(CHAVE_AGUA, JSON.stringify(aguaConsumida));
          await AsyncStorage.setItem(CHAVE_META, JSON.stringify(metaAgua));
        } catch (error) {
          console.error("Erro ao salvar dados da água", error);
        }
      }
    }
    salvarDados();
  }, [aguaConsumida, metaAgua, carregando]);


  // As funções de manipulação continuam as mesmas
  function handleAdicionarAgua(quantidade: number) {
    setAguaConsumida(valorAtual => valorAtual + quantidade);
  }

  function handleDefinirMeta() {
    const novaMetaNumerica = parseInt(tempMetaInput, 10);
    if (!isNaN(novaMetaNumerica) && novaMetaNumerica > 0) {
      setMetaAgua(novaMetaNumerica);
      Alert.alert("Sucesso!", `Sua nova meta é de ${novaMetaNumerica / 1000} litros.`);
    } else {
      Alert.alert("Erro", "Por favor, digite um valor válido em ml.");
    }
  }

  function handleZerarContador() {
    Alert.alert(
      "Zerar Contador",
      "Você tem certeza que deseja zerar a contagem de água?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, Zerar", onPress: () => setAguaConsumida(0), style: 'destructive' }
      ]
    );
  }

  const litrosConsumidos = (aguaConsumida / 1000).toFixed(2);
  const metaEmLitros = (metaAgua / 1000).toFixed(2);
  
  // Tela de loading
  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077cc" />
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <Text style={styles.titulo}>Contador de Água</Text>

        <View style={styles.displayContainer}>
          <Text style={styles.valorPrincipal}>{litrosConsumidos}</Text>
          <Text style={styles.unidade}> / {metaEmLitros} Litros</Text>
        </View>

        <Text style={styles.subtitulo}>Adicionar quantidade:</Text>
        <View style={styles.botoesGrid}>
          <View style={styles.botoesLinha}>
            <TouchableOpacity style={styles.botaoAdicionar} onPress={() => handleAdicionarAgua(180)}><Text style={styles.textoBotao}>+180 ml</Text></TouchableOpacity>
            <TouchableOpacity style={styles.botaoAdicionar} onPress={() => handleAdicionarAgua(250)}><Text style={styles.textoBotao}>+250 ml</Text></TouchableOpacity>
          </View>
          <View style={styles.botoesLinha}>
            <TouchableOpacity style={styles.botaoAdicionar} onPress={() => handleAdicionarAgua(500)}><Text style={styles.textoBotao}>+500 ml</Text></TouchableOpacity>
            <TouchableOpacity style={styles.botaoAdicionar} onPress={() => handleAdicionarAgua(1000)}><Text style={styles.textoBotao}>+1 L</Text></TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.metaContainer}>
            <Text style={styles.subtitulo}>Definir sua meta (em ml):</Text>
            <TextInput
                style={styles.inputMeta}
                keyboardType="numeric"
                value={tempMetaInput}
                onChangeText={setTempMetaInput}
                placeholder="Ex: 3500"
            />
            <Button title="Salvar Nova Meta" onPress={handleDefinirMeta} color="#0077cc" />
        </View>

        <TouchableOpacity style={styles.botaoZerar} onPress={handleZerarContador}>
          <Text style={styles.textoBotaoZerar}>Zerar Contador</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
    // Estilos existentes...
    container: { flex: 1, backgroundColor: '#f0f8ff' },
    content: { padding: 20, flexGrow: 1, alignItems: 'center' },
    titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#005a9c' },
    displayContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
    valorPrincipal: { fontSize: 70, fontWeight: 'bold', color: '#0077cc' },
    unidade: { fontSize: 18, color: '#005a9c', marginBottom: 12, marginLeft: 5 },
    subtitulo: { fontSize: 18, color: '#333', marginBottom: 10 },
    botoesGrid: { width: '90%', marginBottom: 25 },
    botoesLinha: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    botaoAdicionar: { backgroundColor: '#0077cc', paddingVertical: 15, borderRadius: 10, width: '45%', alignItems: 'center' },
    textoBotao: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    metaContainer: { width: '90%', padding: 15, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', marginBottom: 25, borderColor: '#ddd', borderWidth: 1 },
    inputMeta: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, width: '100%', textAlign: 'center', fontSize: 18, marginBottom: 10 },
    botaoZerar: { backgroundColor: '#ffdddd', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#ff8888' },
    textoBotaoZerar: { color: '#cc0000', fontSize: 16 },
    // Novo estilo de loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
    },
});