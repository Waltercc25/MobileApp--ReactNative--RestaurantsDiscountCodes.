export type User = {
    id: string;
    email: string;
    name?: string;
    displayName?: string;
  };
  
  export type Restaurant = {
    id: string;
    name: string;
    description?: string;
    distanceKm?: number; // distancia estimada
    tags?: string[];
  };
  
  export type ReservationCode = {
    id: string;
    restaurantId: string;
    restaurantName: string;
    userId: string;
    people: number;
    discountPercent: number;
    code: string;
    createdAt: string; // ISO
    redeemed?: boolean;
    redeemedAt?: string | null;
  };

  // Tipos de navegación
  export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    Restaurant: { restaurant: Restaurant };
  };

  export type MainTabParamList = {
    Explore: undefined;
    Codes: undefined;
  };