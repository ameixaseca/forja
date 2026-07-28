import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'forja.device_id';

export function newId(): string {
  return Crypto.randomUUID();
}

/**
 * `device_id` persiste entre sessões do app (AsyncStorage) mas é gerado uma
 * única vez por instalação — usado só para telemetria de sync/idempotência,
 * nunca como identidade de usuário (essa vem de `supabase.auth`).
 */
export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = newId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}
