import fs from 'fs/promises';
import path from 'path';
import { DecisionMemoryEntry } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const MEMORY_FILE = path.join(DATA_DIR, 'simulations.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function saveDecision(entry: Omit<DecisionMemoryEntry, 'id' | 'timestamp'>) {
  await ensureDataDir();
  
  let history: DecisionMemoryEntry[] = [];
  try {
    const data = await fs.readFile(MEMORY_FILE, 'utf-8');
    history = JSON.parse(data);
  } catch {
    // File doesn't exist yet or is invalid
  }

  const newEntry: DecisionMemoryEntry = {
    ...entry,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
  };

  history.unshift(newEntry); // Newest first
  
  await fs.writeFile(MEMORY_FILE, JSON.stringify(history, null, 2));
  return newEntry;
}

export async function getDecisionHistory(): Promise<DecisionMemoryEntry[]> {
  try {
    const data = await fs.readFile(MEMORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}
