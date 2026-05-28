import { Product } from '@/types';

// Annual is anchored first (biggest perceived value), monthly makes it look obvious,
// founding member is the IG-cohort scarcity offer.
// TODO(decision): on iOS, pull prices live from StoreKit / App Store Connect — never hard-code.
export const PRODUCTS: Product[] = [
  {
    id: 'annual',
    title: 'Annual',
    price: '$39.99',
    period: '/year',
    blurb: 'Best value — about $3.33/mo. 7-day free trial.',
    trialDays: 7,
    badge: 'Most popular',
  },
  {
    id: 'monthly',
    title: 'Monthly',
    price: '$7.99',
    period: '/month',
    blurb: 'Flexible. Cancel anytime.',
    trialDays: 0,
  },
  {
    id: 'founding',
    title: 'Founding Member',
    price: '$99',
    period: 'once',
    blurb: 'Lifetime access. Capped seats for the founding cohort.',
    trialDays: 0,
    badge: 'Limited seats',
  },
];
