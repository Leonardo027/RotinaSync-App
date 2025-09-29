// services/spotify.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_STORAGE_TOKEN = '@RotinaSync:spotifyToken';

export async function getGenresForPeriod(startTime: Date, endTime: Date): Promise<string[]> {
  const token = await AsyncStorage.getItem(CHAVE_STORAGE_TOKEN);
  if (!token) {
    console.log("Nenhum token do Spotify encontrado. A saltar a busca de géneros.");
    return [];
  }

  const resTracks = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=20`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!resTracks.ok) {
    console.error("Token do Spotify inválido ao buscar músicas recentes.");
    return [];
  }

  const recentTracksData = await resTracks.json();
  const allRecentTracks = recentTracksData.items || [];

  const tracksInPeriod = allRecentTracks.filter((item: any) => {
    const playedAt = new Date(item.played_at);
    return playedAt >= startTime && playedAt <= endTime;
  });

  if (tracksInPeriod.length === 0) {
    console.log("Nenhuma música do Spotify encontrada no período do treino.");
    return [];
  }

  const artistIds = Array.from(new Set<string>(
    tracksInPeriod.flatMap(item => item.track.artists.map((artist: any) => artist.id))
  ));

  if (artistIds.length === 0) return [];

  const allGenres = new Set<string>();
  const chunkSize = 50;
  for (let i = 0; i < artistIds.length; i += chunkSize) {
    const chunk = artistIds.slice(i, i + chunkSize);
    const idsString = chunk.join(',');
    try {
      const resArtists = await fetch(`http://googleusercontent.com/spotify.com/7?ids=${idsString}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (resArtists.ok) {
        const artistsData = await resArtists.json();
        artistsData.artists.forEach((artist: any) => {
          artist.genres.forEach((genre: string) => allGenres.add(genre));
        });
      }
    } catch (error) {
      console.error("Erro num pedaço do pedido de artistas:", error);
    }
  }

  console.log("Géneros encontrados no treino:", Array.from(allGenres));
  return Array.from(allGenres).sort();
}