// app/(tabs)/_layout.tsx

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

// ... (o resto do ficheiro continua igual)

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Metas', tabBarIcon: ({ color }) => <TabBarIcon name="check-square-o" color={color} />, }} />
      <Tabs.Screen name="agua" options={{ title: 'Água', tabBarIcon: ({ color }) => <TabBarIcon name="tint" color={color} />, }} />
      <Tabs.Screen name="atividade" options={{ title: 'Atividade', tabBarIcon: ({ color }) => <TabBarIcon name="heartbeat" color={color} />, }} />
      <Tabs.Screen name="treino" options={{ title: 'Treino', tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />, }} />
      <Tabs.Screen name="nutricao" options={{ title: 'Nutrição', tabBarIcon: ({ color }) => <TabBarIcon name="cutlery" color={color} />, }} />
      {/* --- NOSSA NOVA ABA DE PERFIL --- */}
      <Tabs.Screen
        name="perfil" // O nome do nosso novo ficheiro (perfil.tsx)
        options={{
          title: 'Perfil', // O nome na aba
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />, // Ícone de utilizador
        }}
      />
    </Tabs>
  );
}

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string; }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}