import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { exportarDadosLGPD } from '../src/api/lgpd';
import { useCampaign } from '../src/context/CampaignContext';
import { supabase } from '../src/lib/supabase';
import { SyncService } from '../src/sync/SyncService';

/**
 * ConfigScreen — sync manual, exportação LGPD, logout (tasks.md 5.8).
 * Inclui também login por magic link: design.md (Open Questions) resolve
 * autenticação do Supabase como parte desta tela em vez de uma 8ª tela
 * dedicada — sem ela `auth.uid()` nunca resolve e o sync nunca funciona.
 */
export default function ConfigScreen() {
  const { campaignInstanceId } = useCampaign();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ mensagem: string; erro: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const enviarMagicLink = async () => {
    if (!email || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      setStatus(
        error
          ? { mensagem: `Falha ao enviar link: ${error.message}`, erro: true }
          : { mensagem: 'Link enviado — confira seu email.', erro: false },
      );
    } finally {
      setBusy(false);
    }
  };

  const sair = async () => {
    setBusy(true);
    try {
      await supabase.auth.signOut();
      setStatus({ mensagem: 'Sessão encerrada.', erro: false });
    } finally {
      setBusy(false);
    }
  };

  const sincronizar = async () => {
    if (!campaignInstanceId || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setStatus({ mensagem: 'Faça login para sincronizar.', erro: true });
        return;
      }
      const syncService = new SyncService(supabase, session.user.id);
      const result = await syncService.sync(campaignInstanceId);
      setStatus({
        mensagem: `Sincronizado: ${result.pushed} enviados, ${result.alreadySynced} já sincronizados, ${result.pulled} recebidos.`,
        erro: false,
      });
    } catch (err) {
      setStatus({
        mensagem: `Falha ao sincronizar: ${err instanceof Error ? err.message : String(err)}`,
        erro: true,
      });
    } finally {
      setBusy(false);
    }
  };

  const exportarDados = async () => {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const dados = await exportarDadosLGPD();
      await Share.share({ message: JSON.stringify(dados, null, 2) });
    } catch (err) {
      setStatus({
        mensagem: `Falha ao exportar dados: ${err instanceof Error ? err.message : String(err)}`,
        erro: true,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Config</Text>

      <View style={styles.secao}>
        <Text style={styles.subtitulo}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Pressable style={styles.botao} disabled={busy || !email} onPress={enviarMagicLink}>
          <Text>Enviar link de acesso</Text>
        </Pressable>
        <Pressable style={styles.botao} disabled={busy} onPress={sair}>
          <Text>Sair</Text>
        </Pressable>
      </View>

      <View style={styles.secao}>
        <Text style={styles.subtitulo}>Dados</Text>
        <Pressable style={styles.botao} disabled={busy || !campaignInstanceId} onPress={sincronizar}>
          <Text>Sincronizar agora</Text>
        </Pressable>
        <Pressable style={styles.botao} disabled={busy} onPress={exportarDados}>
          <Text>Exportar meus dados (LGPD)</Text>
        </Pressable>
      </View>

      {status ? (
        <Text style={status.erro ? styles.statusErro : styles.status}>{status.mensagem}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  secao: { gap: 8 },
  subtitulo: { fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10 },
  botao: { padding: 14, borderRadius: 8, backgroundColor: '#333', alignItems: 'center' },
  status: { color: '#333' },
  statusErro: { color: 'red' },
});
