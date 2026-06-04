export interface Arena {
  id: string;
  name: string;
  location: string;
  city: string;
  image: string;
  sports: string[];
  rating: number;
  reviews: number;
  startingPrice: number;
  description: string;
  facilities: string[];
  courts: {
    sport: string;
    count: number;
    pricePerHour: number;
  }[];
  ownerMessage?: string;
  terms?: string[];
}

export interface Booking {
  id: string;
  arenaId: string;
  arenaName: string;
  sport: string;
  court: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export const mockArenas: Arena[] = [
  {
    id: '1',
    name: 'SportZone Arena',
    location: 'Koramangala',
    city: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1624024834874-2a1611305604?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWRtaW50b24lMjBjb3VydCUyMGluZG9vcnxlbnwxfHx8fDE3Njg1NTM0MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sports: ['Badminton', 'Cricket', 'Football'],
    rating: 4.5,
    reviews: 234,
    startingPrice: 400,
    description: 'Premium multi-sport facility with state-of-the-art infrastructure and professional coaching available.',
    facilities: ['Parking', 'Changing Rooms', 'Water', 'First Aid', 'Seating Area'],
    courts: [
      { sport: 'Badminton', count: 6, pricePerHour: 400 },
      { sport: 'Cricket', count: 2, pricePerHour: 1200 },
      { sport: 'Football', count: 1, pricePerHour: 2000 }
    ],
    ownerMessage: 'Welcome to SportZone Arena! Book your slot and enjoy hassle-free gaming experience.',
    terms: ['Minimum 1 hour booking', 'Cancellation allowed up to 2 hours before slot', 'Sports shoes mandatory']
  },
  {
    id: '2',
    name: 'Elite Sports Center',
    location: 'Indiranagar',
    city: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1761644273884-83839f8f22e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBzcG9ydHMlMjBjb3VydHxlbnwxfHx8fDE3Njg2Mjc3MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sports: ['Badminton', 'Football'],
    rating: 4.7,
    reviews: 189,
    startingPrice: 500,
    description: 'AC badminton courts with wooden flooring and premium turf for football enthusiasts.',
    facilities: ['AC Courts', 'Parking', 'Cafeteria', 'Pro Shop', 'Lockers'],
    courts: [
      { sport: 'Badminton', count: 8, pricePerHour: 500 },
      { sport: 'Football', count: 1, pricePerHour: 2500 }
    ],
    ownerMessage: 'Experience the best indoor sports facility in the city!',
    terms: ['ID proof required', 'No metal studs allowed', 'Maximum 2 hours per booking']
  },
  {
    id: '3',
    name: 'Champions Cricket Academy',
    location: 'Whitefield',
    city: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1730739628981-6537b299aea3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlja2V0JTIwZ3JvdW5kJTIwc3RhZGl1bXxlbnwxfHx8fDE3Njg2Mjc2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sports: ['Cricket'],
    rating: 4.8,
    reviews: 156,
    startingPrice: 1000,
    description: 'Professional cricket nets with bowling machines and coaching facility.',
    facilities: ['Bowling Machine', 'Video Analysis', 'Parking', 'Equipment Rental'],
    courts: [
      { sport: 'Cricket', count: 4, pricePerHour: 1000 }
    ],
    ownerMessage: 'Train like a champion at our world-class cricket facility!',
    terms: ['Helmet mandatory', 'Cricket shoes required', 'Coaching available on request']
  },
  {
    id: '4',
    name: 'City Football Ground',
    location: 'HSR Layout',
    city: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1713815713124-362af0201f3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMGZpZWxkJTIwdHVyZnxlbnwxfHx8fDE3Njg2Mjc2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sports: ['Football'],
    rating: 4.6,
    reviews: 298,
    startingPrice: 1800,
    description: 'Full-size turf football ground with floodlights for evening matches.',
    facilities: ['Floodlights', 'Changing Rooms', 'Parking', 'Referee Service', 'Water'],
    courts: [
      { sport: 'Football', count: 2, pricePerHour: 1800 }
    ],
    ownerMessage: 'Book your match and play on premium quality turf!',
    terms: ['Minimum 1 hour slot', 'Football shoes mandatory', 'Maximum 16 players per booking']
  },
  {
    id: '5',
    name: 'Power Play Arena',
    location: 'Marathahalli',
    city: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1766675122854-28fc70f50132?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW5uaXMlMjBjb3VydCUyMG91dGRvb3J8ZW58MXx8fHwxNzY4NTI4OTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    sports: ['Badminton', 'Cricket'],
    rating: 4.3,
    reviews: 176,
    startingPrice: 350,
    description: 'Affordable sports facility with quality courts and friendly staff.',
    facilities: ['Parking', 'Water', 'Seating', 'Equipment Rental'],
    courts: [
      { sport: 'Badminton', count: 4, pricePerHour: 350 },
      { sport: 'Cricket', count: 2, pricePerHour: 900 }
    ],
    ownerMessage: 'Affordable pricing, premium experience!',
    terms: ['Advance booking recommended', 'Cash and online payment accepted']
  },
  {
    id: '6',
    name: 'Grand Sports Complex',
    location: 'Jayanagar',
    city: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1760174012435-630a17a434ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBhcmVuYSUyMGFjdGlvbnxlbnwxfHx8fDE3Njg2Mjc2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sports: ['Badminton', 'Cricket', 'Football'],
    rating: 4.9,
    reviews: 412,
    startingPrice: 450,
    description: 'One of the largest and most well-maintained sports complexes in the city.',
    facilities: ['AC Courts', 'Parking', 'Cafeteria', 'Pro Shop', 'Shower', 'Lockers', 'First Aid'],
    courts: [
      { sport: 'Badminton', count: 10, pricePerHour: 450 },
      { sport: 'Cricket', count: 3, pricePerHour: 1100 },
      { sport: 'Football', count: 2, pricePerHour: 2200 }
    ],
    ownerMessage: 'Join our community of sports enthusiasts and enjoy world-class facilities!',
    terms: ['Membership options available', 'Student discounts on weekdays', 'Tournaments organized monthly']
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    arenaId: '1',
    arenaName: 'SportZone Arena',
    sport: 'Badminton',
    court: 'Court 3',
    date: '2026-01-20',
    time: '18:00 - 19:00',
    duration: 1,
    price: 400,
    status: 'upcoming'
  },
  {
    id: 'b2',
    arenaId: '3',
    arenaName: 'Champions Cricket Academy',
    sport: 'Cricket',
    court: 'Net 2',
    date: '2026-01-22',
    time: '16:00 - 17:00',
    duration: 1,
    price: 1000,
    status: 'upcoming'
  },
  {
    id: 'b3',
    arenaId: '2',
    arenaName: 'Elite Sports Center',
    sport: 'Badminton',
    court: 'Court 1',
    date: '2026-01-10',
    time: '19:00 - 20:00',
    duration: 1,
    price: 500,
    status: 'completed'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'credit',
    amount: 2000,
    description: 'Wallet Recharge',
    date: '2026-01-15'
  },
  {
    id: 't2',
    type: 'debit',
    amount: 400,
    description: 'Booking at SportZone Arena',
    date: '2026-01-18'
  },
  {
    id: 't3',
    type: 'debit',
    amount: 500,
    description: 'Booking at Elite Sports Center',
    date: '2026-01-10'
  }
];

export const mockFavorites: string[] = ['1', '2', '6'];

export const mockMyArenas: string[] = [];