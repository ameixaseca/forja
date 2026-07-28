import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { catalog } from '../content/catalog';
import { getOrCreateActiveCampaignInstanceId } from '../lib/campaignInstance';
import { initDB } from '../storage/sqlite';
import { useFicha, type UseFichaResult } from '../hooks/useFicha';
import { useResolution, type UseResolutionResult } from '../hooks/useResolution';

interface CampaignContextValue {
  campaignInstanceId: string | null;
  ficha: UseFichaResult;
  resolution: UseResolutionResult;
}

const CampaignContext = createContext<CampaignContextValue | null>(null);

/**
 * Instancia `useFicha`/`useResolution` uma única vez para todo o app —
 * telas consomem via `useCampaign()` em vez de cada uma criar sua própria
 * instância dos hooks, evitando dessincronia entre elas (D-033/D5 de
 * design.md: hooks continuam sendo a única porta de entrada de
 * motor/domínio, isto só compartilha essa porta entre telas).
 */
export function CampaignProvider({ children }: PropsWithChildren) {
  const [campaignInstanceId, setCampaignInstanceId] = useState<string | null>(null);

  useEffect(() => {
    void initDB().then(() => getOrCreateActiveCampaignInstanceId()).then(setCampaignInstanceId);
  }, []);

  const ficha = useFicha(campaignInstanceId);
  const resolution = useResolution(campaignInstanceId ?? '', catalog);

  return (
    <CampaignContext.Provider value={{ campaignInstanceId, ficha, resolution }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign(): CampaignContextValue {
  const ctx = useContext(CampaignContext);
  if (!ctx) {
    throw new Error('useCampaign() deve ser chamado dentro de <CampaignProvider>');
  }
  return ctx;
}
