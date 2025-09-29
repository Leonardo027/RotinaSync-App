// app/_layout.tsx

import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message'; // <-- 1. IMPORTAR

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AppLayout() {
  useEffect(() => {
    async function scheduleNotifications() {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const triggerDaily1 = new Date();
      triggerDaily1.setHours(13, 0, 0); 
      if (triggerDaily1.getTime() < new Date().getTime()) {
        triggerDaily1.setDate(triggerDaily1.getDate() + 1);
      }
      
      await Notifications.scheduleNotificationAsync({
        content: { title: "Lembrete da Tarde!", body: "Como estão a correr as suas tarefas? Mantenha o foco!" },
        trigger: { hour: 13, minute: 0, repeats: true },
      });

      const triggerDaily2 = new Date();
      triggerDaily2.setHours(16, 30, 0); 
      if (triggerDaily2.getTime() < new Date().getTime()) {
        triggerDaily2.setDate(triggerDaily2.getDate() + 1);
      }
      
      await Notifications.scheduleNotificationAsync({
        content: { title: "Fim de Tarde Produtivo!", body: "Continue com a sua rotina para um final de dia excelente." },
        trigger: { hour: 16, minute: 30, repeats: true },
      });

      console.log("Lembretes diários agendados para 13:00 e 16:30.");
    }
    scheduleNotifications();
  }, []);

  return (
    <>
      <Tabs>
        <Tabs.Screen name="(tabs)" options={{ headerShown: false }} />
      </Tabs>
      <Toast /> 
    </>
  );
}