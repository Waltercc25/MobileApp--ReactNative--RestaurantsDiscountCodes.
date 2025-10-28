import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { ReservationCode, Restaurant } from '../types';

// Colecciones de Firestore
export const COLLECTIONS = {
  RESTAURANTS: 'restaurants',
  RESERVATION_CODES: 'reservationCodes',
  USERS: 'users'
} as const;

// Funciones para restaurantes
export const getRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const restaurantsRef = collection(db, COLLECTIONS.RESTAURANTS);
    const snapshot = await getDocs(restaurantsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Restaurant));
  } catch (error) {
    console.error('Error al obtener restaurantes:', error);
    throw error;
  }
};

export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  try {
    const restaurantRef = doc(db, COLLECTIONS.RESTAURANTS, id);
    const restaurantSnap = await getDoc(restaurantRef);
    
    if (restaurantSnap.exists()) {
      return {
        id: restaurantSnap.id,
        ...restaurantSnap.data()
      } as Restaurant;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener restaurante:', error);
    throw error;
  }
};

// Funciones para códigos de reserva
export const getReservationCodesByUser = async (userId: string): Promise<ReservationCode[]> => {
  try {
    const codesRef = collection(db, COLLECTIONS.RESERVATION_CODES);
    const q = query(codesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      redeemedAt: doc.data().redeemedAt?.toDate?.()?.toISOString() || null
    } as ReservationCode));
  } catch (error) {
    console.error('Error al obtener códigos de reserva:', error);
    throw error;
  }
};

export const createReservationCode = async (codeData: Omit<ReservationCode, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const codesRef = collection(db, COLLECTIONS.RESERVATION_CODES);
    const docRef = await addDoc(codesRef, {
      ...codeData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear código de reserva:', error);
    throw error;
  }
};

export const redeemReservationCode = async (codeId: string): Promise<void> => {
  try {
    const codeRef = doc(db, COLLECTIONS.RESERVATION_CODES, codeId);
    await updateDoc(codeRef, {
      redeemed: true,
      redeemedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error al canjear código de reserva:', error);
    throw error;
  }
};

export const deleteReservationCode = async (codeId: string): Promise<void> => {
  try {
    const codeRef = doc(db, COLLECTIONS.RESERVATION_CODES, codeId);
    await deleteDoc(codeRef);
  } catch (error) {
    console.error('Error al eliminar código de reserva:', error);
    throw error;
  }
};

// Función para verificar si un código ya existe
export const checkCodeExists = async (code: string): Promise<boolean> => {
  try {
    const codesRef = collection(db, COLLECTIONS.RESERVATION_CODES);
    const q = query(codesRef, where('code', '==', code));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error al verificar código:', error);
    throw error;
  }
};
