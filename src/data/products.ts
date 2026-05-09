import { Product } from '@/store/useCartStore';

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Pó Banana Swiss Beauty',
    price: 39.90,
    category: 'Pó',
    image_url: 'https://images.unsplash.com/photo-1590156546946-cb554ea807fa?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1590156546946-cb554ea807fa?w=400&q=80',
      'https://images.unsplash.com/photo-1516975080661-46b025b5fbba?w=400&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80'
    ],
    active: true,
  },
  {
    id: '2',
    name: 'Lip Bunny Franciny Ehlke',
    price: 45.00,
    category: 'Gloss e batons',
    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&q=80'
    ],
    active: true,
  },
  {
    id: '3',
    name: 'Máscara de Cílios Volume',
    price: 55.90,
    category: 'Máscaras',
    image_url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80'
    ],
    active: true,
  },
  {
    id: '4',
    name: 'Sabonete Facial Glow',
    price: 29.90,
    category: 'Sabonete facial',
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
      'https://images.unsplash.com/photo-1590156546946-cb554ea807fa?w=400&q=80'
    ],
    active: true,
  },
  {
    id: '5',
    name: 'Batom Matte Pêssego',
    price: 35.00,
    category: 'Gloss e batons',
    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
      'https://images.unsplash.com/photo-1516975080661-46b025b5fbba?w=400&q=80'
    ],
    active: true,
  },
  {
    id: '6',
    name: 'Pó Translúcido HD',
    price: 49.90,
    category: 'Pó',
    image_url: 'https://images.unsplash.com/photo-1590156546946-cb554ea807fa?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1590156546946-cb554ea807fa?w=400&q=80',
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&q=80'
    ],
    active: true,
  }
];

export const CATEGORIES = ['Pó', 'Gloss e batons', 'Máscaras', 'Sabonete facial'];
