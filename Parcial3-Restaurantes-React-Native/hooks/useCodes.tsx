import React, { createContext, useContext, useEffect, useState } from 'react';
import { createReservationCode, getReservationCodesByUser, redeemReservationCode, deleteReservationCode } from '../lib/firebaseUtils';
import { ReservationCode } from '../types';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { notificationService } from '../services/notificationService';

type CodesContextValue = {
  codes: ReservationCode[];
  loading: boolean;
  createCode: (restaurantId: string, restaurantName: string, people: number, userId?: string) => Promise<ReservationCode>;
  redeemCode: (codeId: string) => Promise<ReservationCode | null>;
  deleteCode: (codeId: string) => Promise<void>;
  refreshCodes: () => Promise<void>;
};

const CodesContext = createContext<CodesContextValue | undefined>(undefined);

const makeId = (prefix = 'c_') => `${prefix}${Math.random().toString(36).slice(2, 10)}`;

const calculateDiscount = (people: number) => {
  // Simple rules:
  // 1-2 personas => 10%
  // 3-4 personas => 15%
  // 5+ => 20%
  if (people <= 2) return 10;
  if (people <= 4) return 15;
  return 20;
};

export const CodesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [codes, setCodes] = useState<ReservationCode[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Cargar códigos cuando el usuario cambie
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 Usuario autenticado, cargando códigos para:', user.id);
      loadCodes();
    } else {
      console.log('🚪 Usuario no autenticado, limpiando códigos');
      setCodes([]);
    }
  }, [user?.id]);

  const loadCodes = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('📡 Cargando códigos desde Firestore...');
      const userCodes = await getReservationCodesByUser(user.id);
      console.log('✅ Códigos cargados:', userCodes.length);
      setCodes(userCodes);
    } catch (error: any) {
      console.error('❌ Error al cargar códigos:', error);
      
      // Si es un error de índice, mostrar mensaje específico
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.warn('⚠️ Índice de Firestore no configurado. Esperando...');
        // Reintentar después de un momento
        setTimeout(() => {
          if (user?.id) {
            loadCodes();
          }
        }, 3000);
      } else if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
        console.warn('🔒 Permisos de Firestore no configurados. Usando modo offline.');
        setCodes([]);
      } else {
        console.warn('🔄 Error desconocido, reintentando...');
        setCodes([]);
      }
    } finally {
      setLoading(false);
    }
  };


  const createCode = async (restaurantId: string, restaurantName: string, people: number, userId: string = user?.id || 'guest'): Promise<ReservationCode> => {
    try {
      setLoading(true);
      const discount = calculateDiscount(people);
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      
      const newCodeData = {
        restaurantId,
        restaurantName,
        userId,
        people,
        discountPercent: discount,
        code,
        redeemed: false,
        redeemedAt: null,
      };

      // Crear código en Firestore
      const codeId = await createReservationCode(newCodeData);
      
      const newCode: ReservationCode = {
        id: codeId,
        ...newCodeData,
        createdAt: new Date().toISOString(),
      };
      
      setCodes((s) => [newCode, ...s]);
      return newCode;
    } catch (error) {
      console.error('Error al crear código:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const redeemCode = async (codeId: string): Promise<ReservationCode | null> => {
    try {
      setLoading(true);
      
      // Actualizar en Firestore
      await redeemReservationCode(codeId);
      
      let updated: ReservationCode | null = null;
      setCodes((s) =>
        s.map((c) => {
          if (c.id === codeId) {
            updated = { ...c, redeemed: true, redeemedAt: new Date().toISOString() };
            return updated;
          }
          return c;
        })
      );

      // Enviar notificación local
      if (updated) {
        addNotification({
          title: '¡Código canjeado!',
          message: `Tu código ${updated.code} de ${updated.restaurantName} ha sido marcado como canjeado`,
          type: 'success',
        });

        // Enviar notificación por email
        if (user?.email) {
          try {
            await notificationService.sendCodeRedeemedEmail({
              email: user.email,
              restaurantName: updated.restaurantName,
              code: updated.code,
              discountPercent: updated.discountPercent,
              people: updated.people,
              redeemedAt: updated.redeemedAt || new Date().toISOString(),
            });
          } catch (error) {
            console.warn('No se pudo enviar notificación por email:', error);
            // No lanzamos error para no interrumpir el flujo principal
          }
        }
      }

      return updated;
    } catch (error) {
      console.error('Error al canjear código:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCode = async (codeId: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Eliminar de Firestore
      await deleteReservationCode(codeId);
      
      // Eliminar de la lista local
      setCodes((s) => s.filter(c => c.id !== codeId));
      
      console.log('✅ Código eliminado:', codeId);
    } catch (error) {
      console.error('❌ Error al eliminar código:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshCodes = async () => {
    await loadCodes();
  };

  return (
    <CodesContext.Provider 
      value={{ 
        codes, 
        loading, 
        createCode, 
        redeemCode, 
        deleteCode,
        refreshCodes 
      }}
    >
      {children}
    </CodesContext.Provider>
  );
};

export const useCodes = () => {
  const ctx = useContext(CodesContext);
  if (!ctx) throw new Error('useCodes must be used within CodesProvider');
  return ctx;
};