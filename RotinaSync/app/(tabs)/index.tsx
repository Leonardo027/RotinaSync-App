// app/(tabs)/index.tsx

// --- NOVAS IMPORTAÇÕES ---
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// --- A IMPORTAÇÃO DA NOSSA FERRAMENTA DE MEMÓRIA ---
import AsyncStorage from '@react-native-async-storage/async-storage';


interface Tarefa {
  texto: string;
  concluida: boolean;
}

const CHAVE_STORAGE = '@RotinaSync:tarefas'; // Um nome único para nossa "caixinha" de tarefas

export default function TabMetasScreen() {
  const [tarefaAtual, setTarefaAtual] = useState('');
  const [listaDeTarefas, setListaDeTarefas] = useState<Tarefa[]>([]);
  // Novo estado para mostrar que estamos carregando os dados
  const [carregando, setCarregando] = useState(true); 

  // --- GATILHO 1: CARREGAR DADOS (Executa uma única vez quando o app abre) ---
  useEffect(() => {
    async function carregarDados() {
      try {
        const dadosSalvos = await AsyncStorage.getItem(CHAVE_STORAGE);
        if (dadosSalvos !== null) {
          // Se encontramos dados, "traduzimos" de texto para lista e colocamos na memória
          setListaDeTarefas(JSON.parse(dadosSalvos));
        }
      } catch (error) {
        console.error("Erro ao carregar as tarefas", error);
      } finally {
        // Independentemente de ter sucesso ou erro, paramos de mostrar o "carregando"
        setCarregando(false);
      }
    }
    carregarDados();
  }, []); // O `[]` vazio significa: "execute apenas uma vez"

  // --- GATILHO 2: SALVAR DADOS (Executa toda vez que `listaDeTarefas` muda) ---
  useEffect(() => {
    async function salvarDados() {
      // Evitamos salvar durante o carregamento inicial
      if (!carregando) {
        try {
          // "Traduzimos" nossa lista para texto e salvamos na memória
          const dadosEmTexto = JSON.stringify(listaDeTarefas);
          await AsyncStorage.setItem(CHAVE_STORAGE, dadosEmTexto);
        } catch (error) {
          console.error("Erro ao salvar as tarefas", error);
        }
      }
    }
    salvarDados();
  }, [listaDeTarefas, carregando]); // O `[listaDeTarefas]` significa: "execute sempre que esta variável mudar"


  // As funções de manipular as tarefas continuam exatamente as mesmas
  function handleAdicionarTarefa() { /* ...código igual ao anterior... */ }
  function handleApagarTarefa(indexParaApagar: number) { /* ...código igual ao anterior... */ }
  function handleAlternarConclusao(indexParaAlternar: number) { /* ...código igual ao anterior... */ }
  
  // (Colei as funções novamente abaixo para garantir que o arquivo fique completo)
  function handleAdicionarTarefa() {
    if (tarefaAtual.trim() !== '') {
      const novaTarefa: Tarefa = { texto: tarefaAtual, concluida: false };
      setListaDeTarefas(listaAnterior => [...listaAnterior, novaTarefa]);
      setTarefaAtual('');
    }
  }

  function handleApagarTarefa(indexParaApagar: number) {
    const novaLista = listaDeTarefas.filter((_, index) => index !== indexParaApagar);
    setListaDeTarefas(novaLista);
  }

  function handleAlternarConclusao(indexParaAlternar: number) {
    const novaLista = listaDeTarefas.map((tarefa, index) => {
      if (index === indexParaAlternar) {
        return { ...tarefa, concluida: !tarefa.concluida };
      }
      return tarefa;
    });
    setListaDeTarefas(novaLista);
  }

  // Se estiver carregando, mostramos um indicador de atividade
  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando suas tarefas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <Text style={styles.titulo}>Metas e A Fazeres</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite uma nova tarefa..."
          value={tarefaAtual}
          onChangeText={setTarefaAtual}
        />

        <Button
          title="Adicionar"
          onPress={handleAdicionarTarefa}
        />

        <FlatList
          style={styles.lista}
          data={listaDeTarefas}
          scrollEnabled={false} 
          renderItem={({ item, index }) => (
            <View style={[styles.itemContainer, item.concluida ? styles.itemConcluido : null]}>
              <Text style={[styles.itemTexto, item.concluida ? styles.textoConcluido : null]}>
                {item.texto}
              </Text>

              <View style={styles.botoesContainer}>
                <TouchableOpacity onPress={() => handleAlternarConclusao(index)}>
                  <Text style={styles.itemConcluirTexto}>
                    {item.concluida ? 'Refazer' : 'Concluir'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleApagarTarefa(index)}>
                  <Text style={styles.itemApagar}>Apagar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={<Text style={styles.listaVazia}>Nenhuma tarefa ainda. Adicione uma!</Text>}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  // ... (seus estilos existentes) ...
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  content: { padding: 20, flexGrow: 1 },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12, backgroundColor: '#fff', fontSize: 16 },
  lista: { marginTop: 20 },
  listaVazia: { textAlign: 'center', marginTop: 30, color: '#888', fontSize: 16 },
  itemContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemConcluido: { backgroundColor: '#e8f5e9' },
  itemTexto: { fontSize: 16, flex: 1, marginRight: 10 },
  textoConcluido: { textDecorationLine: 'line-through', color: '#aaa' },
  botoesContainer: { flexDirection: 'row', alignItems: 'center' },
  itemConcluirTexto: { color: 'green', fontWeight: 'bold' },
  itemApagar: { color: 'red', fontWeight: 'bold', marginLeft: 15 },
  // --- NOVO ESTILO ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});