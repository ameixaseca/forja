import { Stack } from 'expo-router';
import { CampaignProvider } from '../src/context/CampaignContext';

export default function RootLayout() {
  return (
    <CampaignProvider>
      <Stack
        screenOptions={{
          headerTitle: 'FORJA',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="juramento" options={{ title: 'Juramento' }} />
        <Stack.Screen name="sessao" options={{ title: 'Sessão' }} />
        <Stack.Screen name="resolucao" options={{ title: 'Resolução' }} />
        <Stack.Screen name="historico" options={{ title: 'Histórico' }} />
        <Stack.Screen name="compartilhar" options={{ title: 'Compartilhar' }} />
        <Stack.Screen name="config" options={{ title: 'Config' }} />
      </Stack>
    </CampaignProvider>
  );
}
