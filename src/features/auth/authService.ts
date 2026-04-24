import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const ADMIN_EMAILS = ['mr074770@gmail.com'];

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'customer';
  createdAt: any;
}

export const authService = {
  async getCurrentUserProfile(uid: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  },

  async createUserProfile(user: FirebaseUser, additionalData?: any) {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const role = ADMIN_EMAILS.includes(user.email || '') ? 'admin' : 'customer';
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || additionalData?.displayName || 'User',
        photoURL: user.photoURL || '',
        role,
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, profile);
      return profile;
    }
    return userDoc.data() as UserProfile;
  },

  async signUp(email: string, password: string, displayName: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return this.createUserProfile(user, { displayName });
  },

  async signIn(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return this.getCurrentUserProfile(user.uid);
  },

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    return this.createUserProfile(user);
  },

  async logout() {
    await signOut(auth);
  },

  onAuthChange(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile = await this.getCurrentUserProfile(firebaseUser.uid);
        if (!profile) {
          // If profile doesn't exist in Firestore but user is in Auth, create it
          profile = await this.createUserProfile(firebaseUser);
        }
        callback(profile);
      } else {
        callback(null);
      }
    });
  }
};
