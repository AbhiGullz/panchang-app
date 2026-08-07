import { openDB } from 'idb'
import type { PanchangResponse } from '../types/api'

const DB_NAME = 'panchang-pwa'
const STORE_NAME = 'daily-cache'

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function saveOfflineDay(key: string, value: PanchangResponse) {
  const db = await getDb()
  await db.put(STORE_NAME, value, key)
}

export async function loadOfflineDay(key: string) {
  const db = await getDb()
  return (await db.get(STORE_NAME, key)) as PanchangResponse | undefined
}
