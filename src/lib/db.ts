import Dexie, { type Table } from 'dexie';

export interface MindNode {
  id: string;
  topic: string;
  description?: string; // Rich-text / Markdown notes (Notion/TipTap compatible)
  tags?: string[];
  status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  color?: string;
  image?: string; // Client-compressed DataURL (< 300KB)
  
  // 1. Task & Schedule Management
  task?: {
    startDate?: string;     // YYYY-MM-DD
    endDate?: string;       // YYYY-MM-DD
    duration?: number;      // Days
    progress?: number;      // 0 - 100%
    assignee?: string;
    priority?: 'low' | 'medium' | 'high';
    dependencies?: string[]; // Predecessor node IDs for Critical Path Method (CPM)
    isDailyFocus?: boolean;  // Display in "My Day Agenda"
  };
  // 2. Baseline & Variance Tracking
  baseline?: {
    startDate?: string;
    endDate?: string;
    plannedCost?: number;
  };
  // 3. Resource Workload & Capacity Balancing
  workload?: {
    estimatedHours?: number;
    actualHours?: number;
  };
  // 4. Risk Management Heatmap (5x5 Matrix)
  risk?: {
    probability?: 1 | 2 | 3 | 4 | 5; // 1: Very Low -> 5: Severe
    impact?: 1 | 2 | 3 | 4 | 5;      // 1: Negligible -> 5: Catastrophic
    mitigationPlan?: string;
  };
  // 5. RACI Matrix Assignment
  raci?: {
    responsible?: string[]; // R: Direct Doers
    accountable?: string;   // A: Approver / Owner
    consulted?: string[];   // C: Subject Matter Experts
    informed?: string[];    // I: Informed Stakeholders
  };
  // 6. Prezi-Style Presentation Mode
  presentation?: {
    slideOrder?: number;
    speakerNotes?: string;
  };
  children?: MindNode[];
}

export interface MindMapRecord {
  id: string;
  title: string;
  rootData: MindNode | null;
  encryptedData?: string; // If using AES-GCM encryption, rootData could be serialized and encrypted here
  iv?: string; // Initialization vector for encryption
  createdAt: number;
  updatedAt: number;
  syncStatus: 'synced' | 'pending';
  userId?: string;
}

export interface AICacheRecord {
  promptHash: string;
  prompt: string;
  rootData: MindNode;
  createdAt: number;
}

export class AppDatabase extends Dexie {
  mindmaps!: Table<MindMapRecord, string>;
  aiCache!: Table<AICacheRecord, string>;

  constructor() {
    super('SoDoTuDuyDB');
    this.version(1).stores({
      mindmaps: 'id, title, updatedAt, syncStatus, userId',
      aiCache: 'promptHash, createdAt'
    });
  }
}

export const db = new AppDatabase();

// --- Web Crypto API Helpers (AES-GCM 256-bit) ---

// Generate a cryptographic key from a PIN/Password using PBKDF2
export const generateKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async (data: string, key: CryptoKey): Promise<{ encrypted: string, iv: string }> => {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(data)
  );
  
  // Convert ArrayBuffer to Base64
  const cipherBytes = new Uint8Array(cipherBuffer);
  const cipherBase64 = btoa(String.fromCharCode(...cipherBytes));
  const ivBase64 = btoa(String.fromCharCode(...iv));
  
  return { encrypted: cipherBase64, iv: ivBase64 };
};

export const decryptData = async (encryptedBase64: string, ivBase64: string, key: CryptoKey): Promise<string> => {
  const dec = new TextDecoder();
  const cipherBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  
  const plainBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBytes
  );
  
  return dec.decode(plainBuffer);
};

// Request persistent storage
export const requestPersistentStorage = async (): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    return isPersisted;
  }
  return false;
};
