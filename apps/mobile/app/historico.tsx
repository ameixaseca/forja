import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useCampaign } from '../src/context/CampaignContext';
import type { LocalDiaryEventRow } from '../src/storage/schema';

const ROTULOS: Record<string, string> = {
  juramento_declarado: 'Juramento declarado',
  sessao_registrada: 'Sessão registrada',
  tregua_declarada: 'Trégua declarada',
  tregua_recuperacao_declarada: 'Recuperação de trégua',
  deload_declarado: 'Deload declarado',
  marco_declarado: 'Marco declarado',
  ciclo_encerrado: 'Ciclo encerrado',
};

function Item({ item }: { item: LocalDiaryEventRow }) {
  return (
    <View style={styles.item}>
      <Text style={styles.tipo}>{ROTULOS[item.tipo] ?? item.tipo}</Text>
      <Text style={styles.data}>{new Date(item.ocorridoEm).toLocaleString()}</Text>
    </View>
  );
}

/** HistoricoScreen — lista eventos do log local (tasks.md 5.6). */
export default function HistoricoScreen() {
  const { ficha } = useCampaign();
  const eventosOrdenados = [...ficha.eventos].reverse();

  if (eventosOrdenados.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Nenhum evento registrado ainda.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.lista}
      data={eventosOrdenados}
      keyExtractor={(item) => item.idLocal}
      renderItem={Item}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#ddd' },
  tipo: { fontWeight: '600' },
  data: { color: '#666' },
});
