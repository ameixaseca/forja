import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useCampaign } from '../src/context/CampaignContext';

/**
 * CompartilharScreen — gera artefato de resumo da ficha (tasks.md 5.7).
 * Simplificação MVP: compartilha um resumo em texto via `Share` nativo, não
 * uma screenshot — captura de tela exigiria `react-native-view-shot`, dep.
 * não instalada nesta fase (fora do orçamento das 7 telas).
 */
export default function CompartilharScreen() {
  const { ficha } = useCampaign();

  const compartilhar = async () => {
    const { atributos, vontade, folego, cicloAtual, ciclosCumpridos, juramento } = ficha.ficha;
    const linhas = [
      'Minha ficha na Forja',
      juramento ? `Juramento: ${juramento.diasPorSemana}x/semana` : 'Sem Juramento declarado',
      `Ciclo ${cicloAtual} (${ciclosCumpridos} cumpridos)`,
      `Vontade ${vontade} · Fôlego ${folego}`,
      `Força ${atributos.forca} · Vigor ${atributos.vigor} · Destreza ${atributos.destreza}`,
    ];
    await Share.share({ message: linhas.join('\n') });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compartilhar</Text>
      <Pressable style={styles.botao} onPress={compartilhar}>
        <Text>Compartilhar minha ficha</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  botao: { padding: 14, borderRadius: 8, backgroundColor: '#333', alignItems: 'center' },
});
