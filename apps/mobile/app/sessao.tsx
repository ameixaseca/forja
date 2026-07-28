import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCampaign } from '../src/context/CampaignContext';

/**
 * SessaoScreen — botão "Registrar Sessão" via `useResolution` (tasks.md
 * 5.4). `registrarSessao` usa `Date.now()` como seed (nitpick do code
 * review do Grupo 4): botão fica desabilitado enquanto uma chamada está em
 * andamento para evitar duplo-tap no mesmo milissegundo.
 */
export default function SessaoScreen() {
  const { resolution, ficha } = useCampaign();
  const [registrando, setRegistrando] = useState(false);

  const registrar = async () => {
    if (registrando) return;
    setRegistrando(true);
    try {
      await resolution.registrarSessao();
      // `resolution` mantém sua própria instância interna de useFicha (só
      // para recalcular vontade entre rolagens) — precisa refrescar também
      // o `ficha` do CampaignContext, consumido por Home/Histórico/
      // Compartilhar, senão essas telas ficam com dados desatualizados
      // após registrar sessão (achado do code review final do Grupo 7).
      await ficha.refresh();
      router.push('/resolucao');
    } catch {
      // erro já exposto via `resolution.error` (fonte única, useResolution.ts)
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Sessão</Text>
      <Text>Confirme que você treinou hoje para registrar sua sessão.</Text>
      {resolution.error ? <Text style={styles.erro}>{resolution.error.message}</Text> : null}
      <Pressable style={styles.botao} disabled={registrando} onPress={registrar}>
        <Text>{registrando ? 'Registrando...' : 'Registrar Sessão'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  botao: { padding: 14, borderRadius: 8, backgroundColor: '#333', alignItems: 'center' },
  erro: { color: 'red' },
});
