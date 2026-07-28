import AsyncStorage from '@react-native-async-storage/async-storage';
import { newId } from './ids';

const ACTIVE_CAMPAIGN_KEY = 'forja.active_campaign_instance_id';

/**
 * MVP expõe uma única campanha ativa por vez (design.md, decisão D4).
 * Criação da linha `campaign_instances` no servidor é responsabilidade do
 * sync, fora do escopo de telas — aqui só garante um id local estável para
 * uso offline-first (D-008): Juramento/Sessão podem ser gravados sem rede
 * antes de qualquer sincronização acontecer.
 */
export async function getOrCreateActiveCampaignInstanceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(ACTIVE_CAMPAIGN_KEY);
  if (existing) return existing;
  const generated = newId();
  await AsyncStorage.setItem(ACTIVE_CAMPAIGN_KEY, generated);
  return generated;
}
