# Fase 6: Mobile MVP — FORJA

**Duração:** 2.5 semanas  
**Dependências:** Fase 2 (motor), Fase 3 (domínio), Fase 5 (API)  
**Objetivo:** App Expo offline-first com sync

---

## AI Agent Context

**Artefatos entrada:**

- `@forja/motor-narrativo` (resolve)
- `@forja/dominio` (calcularFicha)
- API `/sync`

**Artefatos saída:**

```
apps/mobile/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Dashboard ficha
│   │   ├── JuramentoScreen.tsx   # Criar juramento
│   │   ├── SessaoScreen.tsx      # Registrar sessão
│   │   ├── ResolucaoScreen.tsx   # Ver resolução
│   │   ├── HistoricoScreen.tsx   # Diário
│   │   ├── CompartilharScreen.tsx
│   │   └── ConfigScreen.tsx
│   ├── storage/
│   │   └── sqlite.ts             # expo-sqlite
│   ├── sync/
│   │   └── SyncService.ts        # Push/pull eventos
│   ├── navigation/
│   │   └── AppNavigator.tsx      # Expo Router
│   └── components/
│       └── ui/                   # Primitives
├── app.json
└── package.json
```

**Comandos verificação:**

```bash
cd apps/mobile
pnpm ios         # Simulador iOS
pnpm android     # Simulador Android
pnpm test:e2e    # Detox E2E
```

---

## Tarefas

### Tarefa 6.1: Setup Expo

**Agente:** `bash`

```bash
npx create-expo-app apps/mobile --template blank-typescript
cd apps/mobile
pnpm add expo-router expo-sqlite @forja/motor-narrativo @forja/dominio
pnpm add react-native-reanimated react-native-gesture-handler
```

**Verificação:** `pnpm ios` abre simulador.

---

### Tarefa 6.2: SQLite Local

**Agente:** `write`
**Arquivo:** `src/storage/sqlite.ts`

```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('forja.db');

export function initDB() {
  db.transaction((tx) => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS diary_events (
        id TEXT PRIMARY KEY,
        tipo TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        payload TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      )
    `);
  });
}

export function insertEvent(event: DiaryEvent) {
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT INTO diary_events (id, tipo, timestamp, payload, synced) VALUES (?, ?, ?, ?, ?)',
      [event.id, event.tipo, event.timestamp, JSON.stringify(event.payload), 0]
    );
  });
}

export function getUnsyncedEvents(): Promise<DiaryEvent[]> {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM diary_events WHERE synced = 0', [], (_, { rows }) => {
        resolve(
          rows._array.map((row) => ({
            id: row.id,
            tipo: row.tipo,
            timestamp: row.timestamp,
            payload: JSON.parse(row.payload),
          }))
        );
      });
    });
  });
}
```

**Verificação:** Insere 1 evento, query retorna.

---

### Tarefa 6.3: SyncService

**Agente:** `write`
**Arquivo:** `src/sync/SyncService.ts`

```typescript
export class SyncService {
  async sync() {
    const unsynced = await getUnsyncedEvents();
    const lastSync = await AsyncStorage.getItem('last_sync');

    const response = await fetch('https://api.forja.app/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ last_sync: lastSync, events_to_push: unsynced }),
    });

    const { events_to_pull, new_sync_token } = await response.json();

    // Inserir eventos do server
    for (const event of events_to_pull) {
      await insertEvent({ ...event, synced: 1 });
    }

    // Marcar locais como synced
    await markEventsSynced(unsynced.map((e) => e.id));
    await AsyncStorage.setItem('last_sync', new_sync_token);
  }
}
```

**Verificação:** Mock fetch, sync insere eventos.

---

### Tarefa 6.4: Telas MVP

**Agente:** `write`
**7 telas principais:**

1. **HomeScreen:** Dashboard com ficha (atributos, vontade, fôlego)
2. **JuramentoScreen:** Form criar juramento (dias/semana, data início/fim)
3. **SessaoScreen:** Botão "Registrar Sessão" → chama `resolve()` → mostra resolução
4. **ResolucaoScreen:** Exibe texto storylet + efeitos
5. **HistoricoScreen:** Lista eventos diário
6. **CompartilharScreen:** Gera artefato (screenshot ficha)
7. **ConfigScreen:** Sync manual, LGPD, logout

**Navegação:** Expo Router (file-based)
**Verificação:** Fluxo completo: criar juramento → registrar sessão → ver resolução.

---

### Tarefa 6.5: Integração Motor

**Agente:** `write`
**Hook:** `useResolution.ts`

```typescript
import { resolve } from '@forja/motor-narrativo';
import { calcularFicha } from '@forja/dominio';

export function useResolution() {
  const registrarSessao = async () => {
    const eventos = await getAllEvents();
    const ficha = calcularFicha(eventos);

    const inputs = {
      rolagem: roll2d6() + ficha.vontade,
      atributo: ficha.atributos,
      vontade: ficha.vontade,
      ciclo_cumprido: true, // Simplificado
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };

    const catalog = require('../../content/campanhas/espinha/catalog.json');
    const seed = Date.now(); // Simplificado; usar server timestamp real

    const result = resolve(catalog, { qualities: {...} }, inputs, seed);

    // Inserir evento
    await insertEvent({
      id: uuid(),
      tipo: 'sessao_registrada',
      timestamp: new Date().toISOString(),
      payload: { storylet_id: result.storylet.id, efeitos: result.efeitos },
    });

    return result;
  };

  return { registrarSessao };
}
```

**Verificação:** Sessão registrada → evento inserido → ficha atualizada.

---

## Critérios Gate

- [ ] Roda iOS + Android simulador
- [ ] 7 telas funcionais
- [ ] Offline 100% (sem API roda)
- [ ] Sync multi-device (2 devices, mesmo user)
- [ ] SQLite armazena eventos
- [ ] Motor integrado (resolve() chamado)
- [ ] Tag `fase-6-completa`

**Próxima fase:** Fase 7 (Web App) — 1 semana
