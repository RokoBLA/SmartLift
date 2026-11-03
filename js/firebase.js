import { firebaseConfig } from '../config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import * as A from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import * as F from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export { A, F };

// Dok config.js ima predloške vrijednosti, aplikacija pokaže upute umjesto da se sruši.
export const configured = !!firebaseConfig.apiKey && !/^YOUR_/i.test(firebaseConfig.apiKey) && !/^YOUR_/i.test(firebaseConfig.projectId);

export let app = null;
export let auth = null;
export let db = null;

if (configured) {
  app = initializeApp(firebaseConfig);
  auth = A.getAuth(app);
  try {
    // Offline podrška: podaci se spremaju u pregledniku i sinkroniziraju čim se vrati internet.
    db = F.initializeFirestore(app, {
      localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }),
    });
  } catch (e) {
    console.warn('Offline spremanje nije dostupno u ovom pregledniku.', e);
    db = F.getFirestore(app);
  }
}
