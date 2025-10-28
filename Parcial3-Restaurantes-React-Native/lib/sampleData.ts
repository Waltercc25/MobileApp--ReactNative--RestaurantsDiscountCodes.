import { Restaurant } from '../types';

export const SAMPLE_RESTAURANTS: Restaurant[] = [
  { id: 'r1', name: 'La Casona', description: 'Comida casera y ambiente familiar', distanceKm: 1.2, tags: ['familiar', 'casera'] },
  { id: 'r2', name: 'Bistro Pareja', description: 'Ideal para cenas románticas', distanceKm: 0.6, tags: ['pareja', 'romántico'] },
  { id: 'r3', name: 'Sushi Central', description: 'Sushi y rolls para compartir', distanceKm: 2.3, tags: ['pareja', 'familiar'] },
  { id: 'r4', name: 'Pizzería Sol', description: 'Pizzas al horno de leña', distanceKm: 0.9, tags: ['familiar', 'rápido'] },
];

export default SAMPLE_RESTAURANTS;