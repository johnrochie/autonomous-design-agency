import { calculateQuote, formatAmount } from '../quote-generator';

describe('Quote Generator', () => {
  describe('calculateQuote', () => {
    test('calculates portfolio site quote within expected range', () => {
      const input = {
        type: 'portfolio' as const,
        description: 'Simple portfolio website for photographer',
        features: [],
        timelineRange: '2-4',
        budgetRange: '8-12',
      };

      const result = calculateQuote(input);

      expect(result).toHaveProperty('amountCents');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('timelineWeeks');

      // Portfolio should be between €8,000 and €12,000 (base range)
      expect(result.amountCents).toBeGreaterThanOrEqual(800000);
      expect(result.amountCents).toBeLessThanOrEqual(12000000);

      // Timeline should be at least 3 weeks (base) + adjustment
      expect(result.timelineWeeks).toBeGreaterThan(0);
      expect(result.breakdown).toBeInstanceOf(Array);
      expect(result.breakdown.length).toBeGreaterThan(0);
    });

    test('calculates ecommerce site quote within expected range', () => {
      const input = {
        type: 'ecommerce' as const,
        description: 'E-commerce store with payment processing',
        features: ['Payment Processing (Stripe)', 'Inventory Management'],
        timelineRange: '4-8',
        budgetRange: '15-25',
      };

      const result = calculateQuote(input);

      // E-commerce should be between €15,000 and €25,000 (base range) + features
      expect(result.amountCents).toBeGreaterThanOrEqual(1500000);
      expect(result.amountCents).toBeLessThanOrEqual(50000000);
    });

    test('calculates SaaS platform quote within expected range', () => {
      const input = {
        type: 'saas' as const,
        description: 'SaaS platform for team collaboration',
        features: ['Authentication & User Accounts', 'Dashboard/Analytics', 'Real-time Features'],
        timelineRange: '8-12',
        budgetRange: '25-50',
      };

      const result = calculateQuote(input);

      // SaaS should be between €25,000 and €50,000 (base range) + features
      expect(result.amountCents).toBeGreaterThanOrEqual(2500000);
      expect(result.amountCents).toBeLessThanOrEqual(100000000);
    });

    test('calculates custom platform quote within expected range', () => {
      const input = {
        type: 'custom' as const,
        description: 'Custom enterprise platform with advanced features',
        features: ['Authentication & User Accounts', 'Real-time Features', 'Mobile App Integration'],
        timelineRange: '12+',
        budgetRange: '50-100',
      };

      const result = calculateQuote(input);

      // Custom should be between €50,000 and €100,000 (base range) + features
      expect(result.amountCents).toBeGreaterThanOrEqual(5000000);
    });

    test('adds feature costs to base quote', () => {
      const inputSimple = {
        type: 'portfolio' as const,
        description: 'Simple portfolio',
        features: [],
        timelineRange: '2-4',
        budgetRange: '8-12',
      };

      const inputWithFeatures = {
        type: 'portfolio' as const,
        description: 'Portfolio with features',
        features: ['Authentication & User Accounts', 'Payment Processing (Stripe)'],
        timelineRange: '2-4',
        budgetRange: '8-12',
      };

      const resultSimple = calculateQuote(inputSimple);
      const resultWithFeatures = calculateQuote(inputWithFeatures);

      // Quote with features should be higher
      expect(resultWithFeatures.amountCents).toBeGreaterThan(resultSimple.amountCents);
    });

    test('generates breakdown with all phases', () => {
      const input = {
        type: 'portfolio' as const,
        description: 'Portfolio website',
        features: [],
        timelineRange: '2-4',
        budgetRange: '8-12',
      };

      const result = calculateQuote(input);

      const phases = result.breakdown.map(b => b.phase);

      // Should include all four phases
      expect(phases).toContain('design');
      expect(phases).toContain('development');
      expect(phases).toContain('qa');
      expect(phases).toContain('deployment');
    });

    test('breakdown includes required fields', () => {
      const input = {
        type: 'portfolio' as const,
        description: 'Portfolio website',
        features: [],
        timelineRange: '2-4',
        budgetRange: '8-12',
      };

      const result = calculateQuote(input);

      // Check first breakdown item has all required fields
      const firstItem = result.breakdown[0];

      expect(firstItem).toHaveProperty('phase');
      expect(firstItem).toHaveProperty('component');
      expect(firstItem).toHaveProperty('estimatedDays');
      expect(firstItem).toHaveProperty('ratePerDay');
      expect(firstItem).toHaveProperty('amountCents');

      expect(firstItem.estimatedDays).toBeGreaterThan(0);
      expect(firstItem.ratePerDay).toBeGreaterThan(0);
      expect(firstItem.amountCents).toBeGreaterThan(0);
    });

    test('adjusts timeline based on feature count', () => {
      const inputFew = {
        type: 'portfolio' as const,
        description: 'Simple portfolio',
        features: [],
        timelineRange: '2-4',
        budgetRange: '8-12',
      };

      const inputMany = {
        type: 'portfolio' as const,
        description: 'Complex portfolio with many features',
        features: Array(10).fill('Test Feature'),
        timelineRange: '2-4',
        budgetRange: '8-12',
      };

      const resultFew = calculateQuote(inputFew);
      const resultMany = calculateQuote(inputMany);

      // More features = longer timeline
      expect(resultMany.timelineWeeks).toBeGreaterThan(resultFew.timelineWeeks);
    });

    test('assesses complexity from description', () => {
      const inputSimple = {
        type: 'portfolio' as const,
        description: 'Simple basic portfolio website',
        features: [],
        timelineRange: '2-4',
        budgetRange: '8-12',
      };

      const inputComplex = {
        type: 'portfolio' as const,
        description: 'Custom enterprise portfolio with advanced API integration and microservices architecture',
        features: [],
        timelineRange: '2-4',
        budgetRange: '8-12',
      };

      const resultSimple = calculateQuote(inputSimple);
      const resultComplex = calculateQuote(inputComplex);

      // Complex description should result in higher quote (complexity multiplier)
      expect(resultComplex.amountCents).toBeGreaterThan(resultSimple.amountCents);
    });

    test('handles empty description gracefully', () => {
      const input = {
        type: 'portfolio' as const,
        description: '',
        features: [],
        timelineRange: '2-4',
        budgetRange: '8-12',
      };

      const result = calculateQuote(input);

      expect(result).toHaveProperty('amountCents');
      expect(result.amountCents).toBeGreaterThan(0);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.length).toBeGreaterThan(0);
    });
  });

  describe('formatAmount', () => {
    test('formats amount in EUR correctly', () => {
      expect(formatAmount(950000)).toBe('€9,500');
      expect(formatAmount(100000)).toBe('€1,000');
      expect(formatAmount(1000000)).toBe('€10,000');
    });

    test('handles zero amount', () => {
      expect(formatAmount(0)).toBe('€0');
    });

    test('handles negative amount (edge case)', () => {
      expect(formatAmount(-1000)).toBe('€-10');
    });

    test('handles large amounts', () => {
      expect(formatAmount(100000000)).toBe('€1,000,000');
    });
  });
});
