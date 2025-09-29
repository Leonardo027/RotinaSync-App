// app/callback.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SPOTIFY_CLIENT_ID } from '../constants/spotify'; // Não usamos o Secret aqui
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_STORAGE_TOKEN = '@RotinaSync:spotifyToken';
const CHAVE_CODE_VERIFIER = '@RotinaSync:spotifyCodeVerifier';
const CHAVE_REDIRECT_URI = '@RotinaSync:spotifyRedirectUri';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';

export default function CallbackScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      const code = params.code as string;
      if (code) {
        hasRun.current = true;
        exchangeCodeForToken(code);
      } else {
        router.replace('/(tabs)/perfil');
      }
    }
  }, [params]);

  async function exchangeCodeForToken(code: string) {
    try {
      const codeVerifier = await AsyncStorage.getItem(CHAVE_CODE_VERIFIER);
      const redirectUri = await AsyncStorage.getItem(CHAVE_REDIRECT_URI);
      if (!codeVerifier || !redirectUri) { throw new Error("Falta o codeVerifier ou o redirectUri"); }

      const res = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        // Corpo do pedido para PKCE puro (sem Authorization header)
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: SPOTIFY_CLIENT_ID,
          code_verifier: codeVerifier,
        }).toString(),
      });

      const data = await res.json();
      if (data.access_token) {
        await AsyncStorage.setItem(CHAVE_STORAGE_TOKEN, data.access_token);
        router.replace('/(tabs)/perfil');
      } else {
        console.error("Erro nos dados recebidos do Spotify:", JSON.stringify(data));
        router.replace('/(tabs)/perfil');
      }
    } catch (error) {
      console.error("Erro ao trocar código por token:", error);
      router.replace('/(tabs)/perfil');
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text>A finalizar a ligação com o Spotify...</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' } });