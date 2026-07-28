import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCampaign } from '../src/context/CampaignContext';
import { useJuramento } from '../src/hooks/useJuramento';

const OPCOES_DIAS = [1, 2, 3, 4, 5, 6];

/** JuramentoScreen — form via `useJuramento` (tasks.md 5.3, RF-004). */
export default function JuramentoScreen() {
  const { campaignInstanceId, ficha } = useCampaign();
  const { declararJuramento, error } = useJuramento(campaignInstanceId ?? '');
  const [diasPorSemana, setDiasPorSemana] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);

  const declarar = async () => {
    if (diasPorSemana === null || !campaignInstanceId || enviando) return;
    setEnviando(true);
    try {
      await declararJuramento(diasPorSemana);
      await ficha.refresh();
      router.back();
    } catch {
      // erro já exposto via `error` do hook
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Declarar Juramento</Text>
      <Text>Quantos dias por semana você se compromete a treinar? (RF-004: 1 a 6)</Text>
      <View style={styles.opcoes}>
        {OPCOES_DIAS.map((dias) => (
          <Pressable
            key={dias}
            style={[styles.opcao, diasPorSemana === dias && styles.opcaoSelecionada]}
            onPress={() => setDiasPorSemana(dias)}
          >
            <Text>{dias}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={styles.erro}>{error.message}</Text> : null}
      <Pressable
        style={styles.botao}
        disabled={diasPorSemana === null || enviando || !campaignInstanceId}
        onPress={declarar}
      >
        <Text>{enviando ? 'Salvando...' : 'Declarar Juramento'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  opcoes: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  opcao: { padding: 12, borderWidth: 1, borderRadius: 8 },
  opcaoSelecionada: { backgroundColor: '#ddd' },
  botao: { padding: 14, borderRadius: 8, backgroundColor: '#333', alignItems: 'center' },
  erro: { color: 'red' },
});
