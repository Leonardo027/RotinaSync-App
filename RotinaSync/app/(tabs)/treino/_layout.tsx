// app/(tabs)/treino/_layout.tsx
import { Stack } from 'expo-router';

export default function TreinoLayout() {
  // Isto define que a nossa secção de treino é uma "pilha" de navegação
  // e esconde o cabeçalho duplicado.
  return <Stack screenOptions={{ headerShown: false }} />;
}