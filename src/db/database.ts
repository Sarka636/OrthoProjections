import { CADModel } from '../types';
import { SAMPLE_MODELS } from './sampleModels';
import { arrayBufferToBase64 } from '../utils/modelParsers';

const DB_NAME = 'OrthographicCAD_DB';
const DB_VERSION = 2; // Incremented version
const STORE_NAME = 'models';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('difficulty', 'difficulty', { unique: false });
        store.createIndex('isSample', 'isSample', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllModels(): Promise<CADModel[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = async () => {
        let models: CADModel[] = request.result || [];
        if (models.length === 0) {
          models = SAMPLE_MODELS;
          await seedDefaultModels(models);
        }
        resolve(models);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error fetching models from DB:', error);
    return SAMPLE_MODELS;
  }
}

export async function seedDefaultModels(models: CADModel[] = SAMPLE_MODELS): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    for (const model of models) {
      store.put(model);
    }
  } catch (error) {
    console.error('Error seeding default models:', error);
  }
}

export async function saveModel(model: CADModel): Promise<void> {
  // Convert ArrayBuffer to Base64 string for safe storage
  let modelToSave: CADModel = { ...model };
  if (model.fileData && model.fileData instanceof ArrayBuffer) {
    modelToSave.fileData = arrayBufferToBase64(model.fileData);
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(modelToSave);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteModel(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function resetDatabaseToSamples(): Promise<CADModel[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const clearRequest = store.clear();

    clearRequest.onsuccess = async () => {
      await seedDefaultModels(SAMPLE_MODELS);
      resolve(SAMPLE_MODELS);
    };
    clearRequest.onerror = () => reject(clearRequest.error);
  });
}
