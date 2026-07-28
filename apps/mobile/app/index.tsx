import { Link } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCampaign } from '../src/context/CampaignContext';

/** HomeScreen — dashboard via `useFicha` (tasks.md 5.2). */
export default function HomeScreen() {
  const { ficha } = useCampaign();

  if (ficha.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const { atributos, vontade, folego, cicloAtual, ciclosCumpridos, juramento } = ficha.ficha;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sua Forja</Text>

      {juramento ? (
        <Text style={styles.section}>Juramento: {juramento.diasPorSemana}x/semana</Text>
      ) : (
        <Text style={styles.section}>Nenhum Juramento declarado ainda.</Text>
      )}

      <Text style={styles.section}>Ciclo atual: {cicloAtual}</Text>
      <Text style={styles.section}>Ciclos cumpridos: {ciclosCumpridos}</Text>
      <Text style={styles.section}>Vontade: {vontade}</Text>
      <Text style={styles.section}>Fôlego: {folego}</Text>
      <Text style={styles.section}>
        Atributos — Força {atributos.forca} · Vigor {atributos.vigor} · Destreza{' '}
        {atributos.destreza}
      </Text>

      <View style={styles.links}>
        <Link href="/juramento">Juramento</Link>
        <Link href="/sessao">Registrar Sessão</Link>
        <Link href="/historico">Histórico</Link>
        <Link href="/compartilhar">Compartilhar</Link>
        <Link href="/config">Config</Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  section: { fontSize: 16 },
  links: { marginTop: 24, gap: 12 },
});
