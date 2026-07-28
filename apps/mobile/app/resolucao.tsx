import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCampaign } from '../src/context/CampaignContext';

/** ResolucaoScreen — exibe texto/efeitos do último resultado (tasks.md 5.5). */
export default function ResolucaoScreen() {
  const { resolution } = useCampaign();
  const ultimo = resolution.ultimoResultado;

  if (!ultimo) {
    return (
      <View style={styles.container}>
        <Text>Nenhuma sessão registrada ainda nesta instância do app.</Text>
        <Link href="/sessao">Registrar Sessão</Link>
      </View>
    );
  }

  const efeitos = Object.entries(ultimo.efeitos);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{ultimo.storylet.id}</Text>
      <Text style={styles.texto}>{ultimo.texto}</Text>

      {efeitos.length > 0 ? (
        <View style={styles.efeitos}>
          <Text style={styles.subtitulo}>Efeitos</Text>
          {efeitos.map(([chave, valor]) => (
            <Text key={chave}>
              {chave}: {String(valor)}
            </Text>
          ))}
        </View>
      ) : null}

      <Link href="/">Voltar para Home</Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  texto: { fontSize: 16 },
  subtitulo: { fontWeight: '600', marginTop: 8 },
  efeitos: { gap: 4 },
});
