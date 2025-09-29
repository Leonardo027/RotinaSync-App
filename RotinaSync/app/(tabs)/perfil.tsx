// app/(tabs)/perfil.tsx

import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Button, Image, Alert, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import { SPOTIFY_CLIENT_ID } from '../../constants/spotify';
import AsyncStorage from '@react-native-async-storage/async-storage';

const scopes = [ "user-read-private", "user-read-email", "user-read-recently-played" ];
const discovery = { authorizationEndpoint: 'https://accounts.spotify.com/authorize' };
const CHAVE_STORAGE_TOKEN = '@RotinaSync:spotifyToken';
const CHAVE_CODE_VERIFIER = '@RotinaSync:spotifyCodeVerifier';
const CHAVE_REDIRECT_URI = '@RotinaSync:spotifyRedirectUri';

export default function TabPerfilScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const redirectUri = makeRedirectUri({ scheme: 'rotinasync', path: 'callback' });
  const [request, response, promptAsync] = useAuthRequest({ clientId: SPOTIFY_CLIENT_ID, scopes: scopes, usePKCE: true, redirectUri: redirectUri }, discovery);

  useFocusEffect(useCallback(() => {
    async function checkTokenAndFetchUser() {
      setIsLoading(true);
      const token = await AsyncStorage.getItem(CHAVE_STORAGE_TOKEN);
      setAccessToken(token);
      if (token) {
        await fetchUserInfo(token);
      } else {
        setUserInfo(null);
        setRecentTracks([]);
        setGenres([]);
      }
      setIsLoading(false);
    }
    checkTokenAndFetchUser();
  }, []));

  async function fetchUserInfo(token: string) {
    try {
      const res = await fetch('https://api.spotify.com/v1/me', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) { throw new Error("Token inválido para buscar user info"); }
      const data = await res.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Erro ao buscar info do utilizador, desligando:", error);
      await logout();
    }
  }

  async function fetchRecentTracks() {
    if (!accessToken) return;
    setIsLoading(true);
    setRecentTracks([]);
    setGenres([]);
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=20', { headers: { 'Authorization': `Bearer ${accessToken}` } });
      if (!res.ok) {
        Alert.alert("Sessão Expirada", "A sua sessão com o Spotify expirou. Por favor, ligue-se novamente.");
        await logout();
        return;
      }
      const data = await res.json();
      const tracks = data.items || [];
      setRecentTracks(tracks);
      if (tracks.length > 0) {
        await fetchGenresForTracks(tracks);
      }
    } catch (error) {
      console.error("Erro ao buscar músicas recentes:", error);
      Alert.alert("Erro", "Não foi possível buscar as suas músicas recentes.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchGenresForTracks(tracks: any[]) {
    if (!accessToken) return;
    const artistIds = Array.from(new Set<string>(
      tracks.flatMap(item => item.track.artists.map((artist: any) => artist.id))
    ));
    if (artistIds.length === 0) return;
    const allGenres = new Set<string>();
    const chunkSize = 50;
    for (let i = 0; i < artistIds.length; i += chunkSize) {
      const chunk = artistIds.slice(i, i + chunkSize);
      const idsString = chunk.join(',');
      try {
        const res = await fetch(`http://googleusercontent.com/spotify.com/7?ids=${idsString}`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        if (res.ok) {
          const data = await res.json();
          data.artists.forEach((artist: any) => { artist.genres.forEach((genre: string) => allGenres.add(genre)); });
        } else {
          const errorText = await res.text();
          console.error("Erro da API de Artistas:", res.status, errorText);
          throw new Error("A resposta da API de artistas não foi ok");
        }
      } catch (error) { console.error("Erro ao buscar géneros dos artistas:", error); break; }
    }
    setGenres(Array.from(allGenres).sort());
  }

  async function logout() {
    await AsyncStorage.multiRemove([CHAVE_STORAGE_TOKEN, CHAVE_CODE_VERIFIER, CHAVE_REDIRECT_URI]);
    setAccessToken(null);
    setUserInfo(null);
    setRecentTracks([]);
    setGenres([]);
  }
  
  async function handleLogin() {
    if (request?.codeVerifier) {
      await AsyncStorage.setItem(CHAVE_CODE_VERIFIER, request.codeVerifier);
      await AsyncStorage.setItem(CHAVE_REDIRECT_URI, redirectUri);
    }
    promptAsync();
  }

  const renderHeader = () => (
    <View style={styles.profileContainer}>
      <Text style={styles.titulo}>Perfil & Ligações</Text>
      {!accessToken ? (
        <Button disabled={!request} title="Ligar ao Spotify" onPress={handleLogin} />
      ) : (
        <View style={styles.profileContainer}>
          {userInfo ? (
            <>
              {userInfo.images?.[0]?.url && ( <Image source={{ uri: userInfo.images[0].url }} style={styles.profileImage} /> )}
              <Text style={styles.profileName}>{userInfo.display_name}</Text>
              <Text style={styles.profileEmail}>{userInfo.email}</Text>
              <View style={styles.separator} />
              <Button title="Buscar Músicas e Géneros Recentes" onPress={fetchRecentTracks} />
            </>
          ) : ( <ActivityIndicator /> )}
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <>
      {genres.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Géneros Encontrados:</Text>
          <View style={styles.genresList}>
            {genres.map(genre => (
              <View key={genre} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      {accessToken && (
        <View style={styles.footerContainer}>
          <View style={styles.separator} />
          <Button title="Desligar do Spotify" onPress={logout} color="red" />
        </View>
      )}
    </>
  );

  if (isLoading && !userInfo && !accessToken) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large"/></View>
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recentTracks}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={styles.trackItem}>
            <Text style={styles.trackName} numberOfLines={1}>{item.track.name}</Text>
            <Text style={styles.artistName} numberOfLines={1}>{item.track.artists[0].name}</Text>
          </View>
        )}
        keyExtractor={(item) => item.played_at + item.track.id}
        contentContainerStyle={styles.listContentContainer}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5ff' },
  listContentContainer: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 28, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  // --- A CORREÇÃO ESTÁ AQUI ---
  profileContainer: { alignItems: 'center', width: '100%' }, 
  footerContainer: { width: '100%', alignItems: 'center' },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 20, },
  profileName: { fontSize: 22, fontWeight: 'bold', },
  profileEmail: { fontSize: 16, color: 'gray', marginBottom: 20, },
  separator: { marginVertical: 20, height: 1, width: '80%', backgroundColor: '#ccc', },
  resultsContainer: { width: '100%', marginTop: 20, },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, },
  trackItem: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginVertical: 5, },
  trackName: { fontWeight: 'bold', fontSize: 16 },
  artistName: { color: 'gray' },
  genresList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', },
  genreTag: { backgroundColor: '#1DB954', borderRadius: 15, paddingVertical: 5, paddingHorizontal: 10, margin: 4, },
  genreText: { color: 'white', fontSize: 12, },
});