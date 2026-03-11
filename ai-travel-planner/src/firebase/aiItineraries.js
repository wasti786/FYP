// src/firebase/aiItineraries.js
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'aiItineraries';

// Save AI-generated itinerary
export const saveAIItinerary = async (userId, tripData, generatedPlan) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      uid: userId,
      tripData,
      generatedPlan,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error saving AI itinerary:', error);
    throw error;
  }
};

// Get user's AI itineraries
export const getUserAIItineraries = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('uid', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const itineraries = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      itineraries.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
      });
    });
    
    return itineraries;
  } catch (error) {
    console.error('Error fetching AI itineraries:', error);
    throw error;
  }
};

// Get single AI itinerary
export const getAIItinerary = async (itineraryId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, itineraryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
      };
    } else {
      throw new Error('Itinerary not found');
    }
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    throw error;
  }
};

// Update AI itinerary
export const updateAIItinerary = async (itineraryId, updates) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, itineraryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating AI itinerary:', error);
    throw error;
  }
};

// Delete AI itinerary
export const deleteAIItinerary = async (itineraryId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, itineraryId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting AI itinerary:', error);
    throw error;
  }
};  