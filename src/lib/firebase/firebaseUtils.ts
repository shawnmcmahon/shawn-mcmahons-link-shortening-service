import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateShortCode, normalizeAlias } from "../utils/linkUtils";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing up with email", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// Link management functions
export interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  userId: string;
  createdAt: Timestamp;
  clickCount: number;
  customAlias?: string;
}

export interface Click {
  id: string;
  linkId: string;
  userId: string;
  timestamp: Timestamp;
  date: string;
}

export const checkShortCodeExists = async (shortCode: string): Promise<boolean> => {
  const linksRef = collection(db, "links");
  const q = query(linksRef, where("shortCode", "==", shortCode));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const createShortLink = async (
  originalUrl: string,
  userId: string,
  customAlias?: string
): Promise<string> => {
  
  let shortCode: string;
  
  if (customAlias) {
    const normalizedAlias = normalizeAlias(customAlias);
    const exists = await checkShortCodeExists(normalizedAlias);
    if (exists) {
      throw new Error("This custom alias is already taken. Please choose another one.");
    }
    shortCode = normalizedAlias;
  } else {
    // Generate a unique short code
    let attempts = 0;
    let isUnique = false;
    shortCode = generateShortCode(); // Initialize before loop
    while (!isUnique && attempts < 10) {
      isUnique = !(await checkShortCodeExists(shortCode));
      if (!isUnique) {
        shortCode = generateShortCode();
        attempts++;
      }
    }
    if (!isUnique) {
      throw new Error("Failed to generate a unique short code. Please try again.");
    }
  }

  const linkData = {
    shortCode,
    originalUrl,
    userId,
    createdAt: serverTimestamp(),
    clickCount: 0,
    ...(customAlias && { customAlias: normalizeAlias(customAlias) }),
  };

  const docRef = await addDoc(collection(db, "links"), linkData);
  return docRef.id;
};

export const getUserLinks = async (userId: string): Promise<Link[]> => {
  const linksRef = collection(db, "links");
  let querySnapshot;
  
  try {
    // Try with orderBy first
    const q = query(linksRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    querySnapshot = await getDocs(q);
  } catch (error: any) {
    // If orderBy fails (missing index), query without it
    if (error.code === "failed-precondition") {
      const q = query(linksRef, where("userId", "==", userId));
      querySnapshot = await getDocs(q);
    } else {
      throw error;
    }
  }
  
  const links = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Link[];
  
  // Sort by createdAt descending (newest first)
  links.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || (a.createdAt as any)?.seconds || 0;
    const bTime = b.createdAt?.toMillis?.() || (b.createdAt as any)?.seconds || 0;
    return bTime - aTime;
  });
  
  return links;
};

export const getUserLinksRealtime = (
  userId: string,
  callback: (links: Link[]) => void
): () => void => {
  const linksRef = collection(db, "links");
  // Try with orderBy first - if index is missing, fallback in error handler
  const q = query(linksRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const links = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Link[];
      
      // Sort by createdAt descending (newest first) as backup
      links.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || (a.createdAt as any)?.seconds || 0;
        const bTime = b.createdAt?.toMillis?.() || (b.createdAt as any)?.seconds || 0;
        return bTime - aTime;
      });
      
      callback(links);
    },
    (error) => {
      // If orderBy fails (missing index), retry without it and sort client-side
      if (error.code === "failed-precondition") {
        console.warn("Firestore index missing, using client-side sort");
        const fallbackQ = query(linksRef, where("userId", "==", userId));
        onSnapshot(
          fallbackQ,
          (snapshot: QuerySnapshot<DocumentData>) => {
            const links = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Link[];
            
            links.sort((a, b) => {
              const aTime = a.createdAt?.toMillis?.() || (a.createdAt as any)?.seconds || 0;
              const bTime = b.createdAt?.toMillis?.() || (b.createdAt as any)?.seconds || 0;
              return bTime - aTime;
            });
            
            callback(links);
          },
          (fallbackError) => {
            console.error("Error in fallback query:", fallbackError);
            callback([]);
          }
        );
      } else {
        console.error("Error in getUserLinksRealtime:", error);
        callback([]);
      }
    }
  );
  
  return unsubscribe;
};

export const getLinkByShortCode = async (shortCode: string): Promise<Link | null> => {
  const linksRef = collection(db, "links");
  const q = query(linksRef, where("shortCode", "==", shortCode));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Link;
};

export const trackClick = async (linkId: string, shortCode: string): Promise<void> => {
  const linkRef = doc(db, "links", linkId);
  const linkDoc = await getDoc(linkRef);
  
  if (!linkDoc.exists()) {
    throw new Error("Link not found");
  }
  
  const linkData = linkDoc.data();
  const userId = linkData.userId;
  
  // Increment click count
  await updateDoc(linkRef, {
    clickCount: increment(1),
  });
  
  // Log click event
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD format
  
  await addDoc(collection(db, "clicks"), {
    linkId,
    userId,
    timestamp: serverTimestamp(),
    date: dateStr,
  });
};

export const getLinkAnalytics = async (linkId: string): Promise<{
  link: Link;
  clicks: Click[];
}> => {
  const linkRef = doc(db, "links", linkId);
  const linkDoc = await getDoc(linkRef);
  
  if (!linkDoc.exists()) {
    throw new Error("Link not found");
  }
  
  const link = {
    id: linkDoc.id,
    ...linkDoc.data(),
  } as Link;
  
  const clicksRef = collection(db, "clicks");
  let clicksSnapshot;
  
  try {
    // Try with orderBy first (requires composite index)
    const q = query(clicksRef, where("linkId", "==", linkId), orderBy("timestamp", "desc"));
    clicksSnapshot = await getDocs(q);
  } catch (error: any) {
    // If index is missing, query without orderBy and sort client-side
    if (error.code === "failed-precondition") {
      const q = query(clicksRef, where("linkId", "==", linkId));
      clicksSnapshot = await getDocs(q);
    } else {
      throw error;
    }
  }
  
  let clicks = clicksSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Click[];
  
  // Sort by timestamp descending (newest first) - backup if orderBy fails
  clicks.sort((a, b) => {
    const aTime = a.timestamp?.toMillis?.() || (a.timestamp as any)?.seconds || 0;
    const bTime = b.timestamp?.toMillis?.() || (b.timestamp as any)?.seconds || 0;
    return bTime - aTime;
  });
  
  return { link, clicks };
};

export const deleteLink = async (linkId: string, userId: string): Promise<void> => {
  const linkRef = doc(db, "links", linkId);
  const linkDoc = await getDoc(linkRef);
  
  if (!linkDoc.exists()) {
    throw new Error("Link not found");
  }
  
  const linkData = linkDoc.data();
  if (linkData.userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own links");
  }
  
  // Delete the link
  await deleteDoc(linkRef);
  
  // Delete all associated clicks
  const clicksRef = collection(db, "clicks");
  const q = query(clicksRef, where("linkId", "==", linkId));
  const clicksSnapshot = await getDocs(q);
  
  const deletePromises = clicksSnapshot.docs.map((clickDoc) => deleteDoc(clickDoc.ref));
  await Promise.all(deletePromises);
};
