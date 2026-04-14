import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app  = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Persist session across browser restarts
setPersistence(auth, browserLocalPersistence).catch(console.error)

/**
 * Sign in with email + password.
 * @returns {Promise<UserCredential>}
 */
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

/**
 * Sign the current user out.
 * @returns {Promise<void>}
 */
export const logout = () => signOut(auth)

/**
 * Get the current user's Firebase ID token (used as Bearer in API calls).
 * @returns {Promise<string|null>}
 */
export const getIdToken = async () => {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken(/* forceRefresh= */ false)
}

/**
 * Subscribe to authentication state changes.
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {() => void} unsubscribe function
 */
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback)

export { auth }
export default app
