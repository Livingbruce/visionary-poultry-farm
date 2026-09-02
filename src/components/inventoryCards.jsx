import { Egg, Wheat, Sprout } from 'lucide-react';

export const inventoryData = [
    {
      id: 'egg-count',
      title: 'Egg count',
      value: '10',
      unit: 'Trays / Units',
      description: 'Track of the number of eggs available.',
      icon: Egg,
      colorClass: 'egg'
    },
    {
      id: 'feed-stock',
      title: 'Feed stock',
      value: '140.50',
      unit: 'Bags / kg',
      description: 'Track of the amount of feed available.',
      icon: Wheat,
      colorClass: 'feed'
    },
    {
      id: 'manure-stock',
      title: 'Manure stock',
      value: '5.50',
      unit: 'Bags / Tons',
      description: 'Track of the amount of manure available.',
      icon: Sprout,
      colorClass: 'manure'
    }
  ];