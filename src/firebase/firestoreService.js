// src/firebase/firestoreService.js

import { db, auth } from './config';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';

const getUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return user.uid;
};

// Product Drafts Functions
export const saveProductDraft = async (productData) => {
  const userId = getUserId();
  const draftWithUserId = { ...productData, userId, createdAt: new Date() };
  const docRef = await addDoc(collection(db, "products"), draftWithUserId);
  return docRef.id;
};

export const getProductDrafts = async () => {
  const userId = getUserId();
  const q = query(collection(db, "products"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const drafts = [];
  querySnapshot.forEach((doc) => {
    drafts.push({ id: doc.id, ...doc.data() });
  });
  return drafts.sort((a, b) => b.createdAt - a.createdAt);
};

export const updateProductDraft = async (draftId, productData) => {
    const draftRef = doc(db, "products", draftId);
    await updateDoc(draftRef, productData);
};

export const deleteProductDraft = async (draftId) => {
  await deleteDoc(doc(db, "products", draftId));
};

// Field Settings Functions
export const saveFieldSettings = async (settings) => {
    const userId = getUserId();
    const settingsRef = doc(db, "userSettings", userId);
    await setDoc(settingsRef, { fields: settings });
};

export const getFieldSettings = async () => {
    const userId = getUserId();
    const settingsRef = doc(db, "userSettings", userId);
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
        return docSnap.data().fields;
    } else {
        // Return default settings if none are saved
        return {
            offer: true, unit: true, qty: true, brand: true,
            size: true, color: true, delivery: true, status: true,
            category: true, desc: true, video: true, customFields: true,
        };
    }
};
