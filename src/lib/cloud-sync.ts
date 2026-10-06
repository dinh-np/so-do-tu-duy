import { db as localDb, MindMapRecord } from './db';
import { db as firestore, auth } from './firebase';
import { collection, doc, setDoc, getDocs, query, where, getDoc } from 'firebase/firestore';

export class CloudSync {
  static async syncUp() {
    const user = auth.currentUser;
    if (!user) return; // User not logged in, cannot sync

    try {
      // Find all pending records
      const pendingRecords = await localDb.mindmaps.where('syncStatus').equals('pending').toArray();
      
      for (const record of pendingRecords) {
        // Prepare data for firestore (we might want to just sync the encrypted blob or the raw data)
        // Since zero-knowledge encryption is a requirement, we should ideally sync `encryptedData`.
        // But for demonstration, we sync the whole record minus `rootData` if `encryptedData` exists.
        const docRef = doc(firestore, 'users', user.uid, 'mindmaps', record.id);
        
        const payload: any = {
          id: record.id,
          title: record.title,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };

        if (record.encryptedData && record.iv) {
          payload.encryptedData = record.encryptedData;
          payload.iv = record.iv;
        } else {
          // If no encryption is enabled yet, sync raw data (fallback)
          payload.rootData = record.rootData;
        }

        await setDoc(docRef, payload, { merge: true });
        
        // Mark as synced locally
        await localDb.mindmaps.update(record.id, { syncStatus: 'synced', userId: user.uid });
      }
      
      console.log(`[CloudSync] Synced ${pendingRecords.length} records to cloud.`);
    } catch (err) {
      console.error('[CloudSync] Sync up failed:', err);
    }
  }

  static async syncDown() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(collection(firestore, 'users', user.uid, 'mindmaps'));
      const querySnapshot = await getDocs(q);
      
      const localMaps = await localDb.mindmaps.toArray();
      const localMapDict = new Map(localMaps.map(m => [m.id, m]));

      for (const docSnap of querySnapshot.docs) {
        const cloudData = docSnap.data() as any;
        const localData = localMapDict.get(cloudData.id);

        // Conflict resolution: simple Last-Write-Wins
        if (!localData || cloudData.updatedAt > localData.updatedAt) {
          const newRecord: MindMapRecord = {
            id: cloudData.id,
            title: cloudData.title,
            createdAt: cloudData.createdAt,
            updatedAt: cloudData.updatedAt,
            syncStatus: 'synced',
            userId: user.uid,
            rootData: cloudData.rootData || null,
            encryptedData: cloudData.encryptedData,
            iv: cloudData.iv
          };
          await localDb.mindmaps.put(newRecord);
        }
      }
      console.log(`[CloudSync] Sync down completed.`);
    } catch (err) {
      console.error('[CloudSync] Sync down failed:', err);
    }
  }

  static startAutoSync() {
    // Listen to online events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[CloudSync] Device is online. Starting background sync...');
        this.syncUp();
        this.syncDown();
      });

      // Periodically sync if online
      setInterval(() => {
        if (navigator.onLine) {
          this.syncUp();
        }
      }, 60000); // Every 1 minute
    }
  }
}
