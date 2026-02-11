/**
 * Quote Generator v1 - Formula-based
 *
 * Calculates project quotes based on project type, complexity, and features.
 */

export interface QuoteResult {
  amountCents: number;
  breakdown: QuoteBreakdown[];
  timelineWeeks: number;
}

export interface QuoteBreakdown {
  phase: string;
  component: string;
  description?: string;
  estimatedDays: number;
  ratePerDay: number;
  amountCents: number;
}

export interface ProjectInput {
  type: 'portfolio' | 'ecommerce' | 'saas' | 'custom';
  description?: string | null;
  features: string[];
  timelineRange?: string | null;
  budgetRange?: string | null;
}

// Base rates and complexity multipliers
const ProjectBaseRates = {
  portfolio: {
    minAmountCents: 800000, // €8,000
    maxAmountCents: 1200000, // €12,000
    baseWeeks: 3,
    ratePerDay: 500 * 100, // €500/day in cents
  },
  ecommerce: {
    minAmountCents: 1500000, // €15,000
    maxAmountCents: 2500000, // €25,000
    baseWeeks: 6,
    ratePerDay: 500 * 100,
  },
  saas: {
    minAmountCents: 2500000, // €25,000
    maxAmountCents: 5000000, // €50,000
    baseWeeks: 10,
    ratePerDay: 600 * 100, // €600/day
  },
  custom: {
    minAmountCents: 5000000, // €50,000
    maxAmountCents: 10000000, // €100,000
    baseWeeks: 12,
    ratePerDay: 600 * 100,
  },
};

// Feature complexity costs (in cents)
const FeatureCosts = {
  'Authentication & User Accounts': 100000, // €1,000
  'Payment Processing (Stripe)': 150000, // €1,500
  'Content Management System (CMS)': 200000, // €2,000
  'Blog/News Section': 100000, // €1,000
  'Contact Forms & Lead Capture': 50000, // €500
  'Image Gallery/Portfolio': 100000, // €1,000
  'Live Chat/Support Widget': 50000, // €500
  'Booking System': 150000, // €1,500
  'Inventory Management': 200000, // €2,000
  'Dashboard/Analytics': 200000, // €2,000
  'Real-time Features': 300000, // €3,000
  'Mobile App Integration': 500000, // €5,000
  'Multi-language Support': 150000, // €1,500
  'Email Notifications': 100000, // €1,000
  'Search Functionality': 150000, // €1,500
};

/**
 * Calculate quote based on project input
 */
export function calculateQuote(input: ProjectInput): QuoteResult {
  const baseRate = ProjectBaseRates[input.type];
  const featureCost = calculateFeatureCost(input.features);
  const complexity = assessComplexity(input);

  // Calculate base amount within range
  const baseAmount = baseRate.minAmountCents + (baseRate.maxAmountCents - baseRate.minAmountCents) * (complexity - 1) / 2;

  // Total amount = base + features
  const totalAmount = Math.round(baseAmount + featureCost);

  // Calculate timeline adjustment based on features
  const timelineAdjustment = Math.round(input.features.length * 0.3);
  const timelineWeeks = baseRate.baseWeeks + timelineAdjustment;

  // Generate breakdown
  const breakdown = generateQuoteBreakdown(input.type, totalAmount, timelineWeeks, baseRate.ratePerDay);

  return {
    amountCents: totalAmount,
    breakdown,
    timelineWeeks,
  };
}

/**
 * Calculate total cost of selected features
 */
function calculateFeatureCost(features: string[]): number {
  let total = 0;

  for (const feature of features) {
    if (FeatureCosts[feature as keyof typeof FeatureCosts]) {
      total += FeatureCosts[feature as keyof typeof FeatureCosts];
    }
  }

  return total;
}

/**
 * Assess project complexity based on description and features
 * Returns 1 (simple), 1.5 (medium), or 2 (complex)
 */
function assessComplexity(input: ProjectInput): number {
  const featureCount = input.features.length;
  const description = (input.description || '').toLowerCase();

  let complexityScore = 1;

  // Feature count complexity
  if (featureCount > 8) complexityScore += 0.5;
  else if (featureCount > 4) complexityScore += 0.25;

  // Description complexity signals
  const complexSignals = [
    'custom', 'complex', 'sophisticated', 'advanced', 'enterprise',
    'scalable', 'microservices', 'api', 'integration', 'database',
    'backend', 'frontend', 'full-stack', 'multi-platform',
  ];

  const simpleSignals = [
    'simple', 'basic', 'minimal', 'clean', 'minimalist', 'starter',
  ];

  const descriptionWords = description.split(/\s+/);
  const hasComplexSignals = complexSignals.some(signal => description.includes(signal));
  const hasSimpleSignals = simpleSignals.some(signal => description.includes(signal));

  if (hasComplexSignals) complexityScore += 0.5;
  if (hasSimpleSignals) complexityScore -= 0.25;

  return Math.max(1, Math.min(2, complexityScore));
}

/**
 * Generate detailed quote breakdown by phase
 */
function generateQuoteBreakdown(
  projectType: string,
  totalAmount: number,
  timelineWeeks: number,
  ratePerDay: number
): QuoteBreakdown[] {
  const breakdown: QuoteBreakdown[] = [];

  // Phase distribution percentages
  const phaseDistribution = {
    portfolio: {
      design: 40,
      development: 40,
      qa: 10,
      deployment: 10,
    },
    ecommerce: {
      design: 30,
      development: 45,
      qa: 15,
      deployment: 10,
    },
    saas: {
      design: 25,
      development: 50,
      qa: 15,
      deployment: 10,
    },
    custom: {
      design: 25,
      development: 55,
      qa: 12,
      deployment: 8,
    },
  };

  const distribution = phaseDistribution[projectType as keyof typeof phaseDistribution] || phaseDistribution.portfolio;

  const totalDays = timelineWeeks * 5; // 5 work days per week

  // Design phase breakdown
  const designDays = Math.round(totalDays * (distribution.design / 100));
  const designAmount = Math.round(totalAmount * (distribution.design / 100));
  breakdown.push(
    ...getDesignBreakdown(projectType, designDays, ratePerDay, designAmount)
  );

  // Development phase breakdown
  const devDays = Math.round(totalDays * (distribution.development / 100));
  const devAmount = Math.round(totalAmount * (distribution.development / 100));
  breakdown.push(
    ...getDevelopmentBreakdown(projectType, devDays, ratePerDay, devAmount)
  );

  // QA phase
  const qaDays = Math.round(totalDays * (distribution.qa / 100));
  const qaAmount = Math.round(totalAmount * (distribution.qa / 100));
  breakdown.push(
    {
      phase: 'qa',
      component: 'Testing & QA',
      description: 'Comprehensive testing, bug fixing, quality assurance',
      estimatedDays: qaDays,
      ratePerDay,
      amountCents: qaAmount,
    }
  );

  // Deployment phase
  const deploymentDays = Math.round(totalDays * (distribution.deployment / 100));
  const deploymentAmount = Math.round(totalAmount * (distribution.deployment / 100));
  breakdown.push(
    {
      phase: 'deployment',
      component: 'Deployment & Launch',
      description: 'Production deployment, final testing, live launch',
      estimatedDays: deploymentDays,
      ratePerDay,
      amountCents: deploymentAmount,
    }
  );

  return breakdown;
}

/**
 * Get design phase breakdown components
 */
function getDesignBreakdown(projectType: string, totalDays: number, ratePerDay: number, totalAmount: number): QuoteBreakdown[] {
  const breakdowns: QuoteBreakdown[] = [];

  const components = [
    {
      component: 'UI/UX Design',
      description: 'User interface design, user experience optimization',
      percent: 40,
    },
    {
      component: 'Wireframes & Prototyping',
      description: 'Wireframe creation, interactive prototypes',
      percent: 30,
    },
    {
      component: 'Responsive Design',
      description: 'Mobile, tablet, desktop responsive layouts',
      percent: 30,
    },
  ];

  for (const comp of components) {
    const days = Math.round(totalDays * (comp.percent / 100));
    const amount = Math.round(totalAmount * (comp.percent / 100));

    breakdowns.push({
      phase: 'design',
      component: comp.component,
      description: comp.description,
      estimatedDays: days,
      ratePerDay,
      amountCents: amount,
    });
  }

  return breakdowns;
}

/**
 * Get development phase breakdown components
 */
function getDevelopmentBreakdown(projectType: string, totalDays: number, ratePerDay: number, totalAmount: number): QuoteBreakdown[] {
  const breakdowns: QuoteBreakdown[] = [];

  if (projectType === 'portfolio') {
    breakdowns.push(
      {
        phase: 'development',
        component: 'Frontend Development',
        description: 'React/Next.js frontend implementation',
        estimatedDays: Math.round(totalDays * 0.6),
        ratePerDay,
        amountCents: Math.round(totalAmount * 0.6),
      },
      {
        phase: 'development',
        component: 'CMS Integration',
        description: 'Content management system integration',
        estimatedDays: Math.round(totalDays * 0.3),
        ratePerDay,
        amountCents: Math.round(totalAmount * 0.3),
      },
      {
        phase: 'development',
        component: 'API Integration',
        description: 'Third-party API integrations',
        estimatedDays: Math.round(totalDays * 0.1),
        ratePerDay,
        amountCents: Math.round(totalAmount * 0.1),
      }
    );
  } else if (projectType === 'ecommerce') {
    breakdowns.push(
      {
        phase: 'development',
        component: 'Frontend Development',
        description: 'React/Next.js e-commerce frontend',
        estimatedDays: Math.round(totalDays * 0.4),
        ratePerDay,
        amountCents: Math.round(totalAmount * 0.4),
      },
      {
        phase: 'development',
        component: 'Backend Development',
        description: 'Node.js/Express backend implementation',
        estimatedDays: Math.round(totalDays * 0.3),
        ratePerDay,
        amountCents: Math.round(totalAmount * 0.3),
      },
      {
        phase: 'development',
        component: 'E-commerce Features',
        description: 'Product catalog, cart, checkout implementation',
        estimatedDays: Math.round(totalDays * 0.2),
        ratePerDay,
        amountCents: Math.round(totalAmount * 0.2),
      },
      {
        phase: 'development',
        component: 'Stripe Integration',
        description: 'Payment processing via Stripe',
        estimatedDays: Math.round(totalDays * 0.1),
        ratePerDay,
        amountCents: Math.round(totalAmount * 0.1),
      }
    );
  } else {
    // SaaS and custom
    breakdowns.push(
      {
        phase: 'development',
        component: 'Frontend Development',
        description: 'React/Next.js frontend implementation',
        estimatedDays: Math.round(totalDays * 0.4),
        ratePerDay,
        amountCents: Math.round(totalAmount * 0.4),
      },
      {
        phase: 'development',
        component: 'Backend Development',
        description: 'Full backend implementation with API',
        estimatedDays: Math.round(totalDays * 0.5),
        ratePerDay,
        amountCents: Math.round(totalAmount * 0.5),
      },
      {
        phase: 'development',
        component: 'Integration & Features',
        description: 'Third-party integrations and custom features',
        estimatedDays: Math.round(totalDays * 0.1),
        ratePerDay,
        amountCents: Math.round(totalAmount * 0.1),
      }
    );
  }

  return breakdowns;
}

/**
 * Format amount in EUR
 */
export function formatAmount(cents: number): string {
  return `€${(cents / 100).toLocaleString('en-IE')}`;
}
