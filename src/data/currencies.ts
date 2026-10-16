export interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  flag: string; // 2-letter country code or flag emoji
  region: 'ASEAN' | 'Asia-Pacific' | 'Americas' | 'Europe' | 'Middle East';
  masUnit: 1 | 100; // MAS conventional quote unit (e.g. JPY, IDR, THB, KRW quoted per 100 units)
  sgdRate: number; // Units of this currency per 1 SGD
  change24h: number; // Percent change in 24h
  high24h: number;
  low24h: number;
  sparkline: number[]; // 7 points
  history30d: { date: string; rate: number }[];
  popular?: boolean;
}

// Helper to generate 30 days of realistic historical rates around a base rate
function generateHistory(baseRate: number, volatility: number = 0.004): { date: string; rate: number }[] {
  const result: { date: string; rate: number }[] = [];
  const today = new Date(2026, 9, 15); // Oct 15, 2026
  let current = baseRate * (1 - volatility * 10);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
    // Random walk with drift toward baseRate
    const drift = (baseRate - current) * 0.12;
    const step = (Math.sin(i * 0.7) * 0.5 + (Math.cos(i * 1.3) * 0.5)) * volatility * baseRate;
    current = +(current + drift + step).toFixed(4);
    result.push({ date: dateStr, rate: current });
  }
  // Ensure last entry matches baseRate
  result[result.length - 1].rate = baseRate;
  return result;
}

export const INITIAL_CURRENCIES: Currency[] = [
  // ASEAN (Critical for Singapore cross-border)
  {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    country: 'Malaysia',
    flag: '🇲🇾',
    region: 'ASEAN',
    masUnit: 1,
    sgdRate: 3.5185,
    change24h: 0.28,
    high24h: 3.5240,
    low24h: 3.5090,
    sparkline: [3.509, 3.512, 3.510, 3.515, 3.514, 3.517, 3.5185],
    history30d: generateHistory(3.5185, 0.003),
    popular: true,
  },
  {
    code: 'IDR',
    name: 'Indonesian Rupiah',
    symbol: 'Rp',
    country: 'Indonesia',
    flag: '🇮🇩',
    region: 'ASEAN',
    masUnit: 100, // MAS quotes per 100 IDR
    sgdRate: 12210.50,
    change24h: -0.15,
    high24h: 12260.00,
    low24h: 12180.00,
    sparkline: [12240, 12255, 12230, 12215, 12190, 12200, 12210.5],
    history30d: generateHistory(12210.5, 0.005),
    popular: true,
  },
  {
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    country: 'Thailand',
    flag: '🇹🇭',
    region: 'ASEAN',
    masUnit: 100, // MAS quotes per 100 THB
    sgdRate: 26.85,
    change24h: 0.42,
    high24h: 26.92,
    low24h: 26.74,
    sparkline: [26.74, 26.78, 26.80, 26.79, 26.83, 26.81, 26.85],
    history30d: generateHistory(26.85, 0.004),
    popular: true,
  },
  {
    code: 'PHP',
    name: 'Philippine Peso',
    symbol: '₱',
    country: 'Philippines',
    flag: '🇵🇭',
    region: 'ASEAN',
    masUnit: 100, // MAS quotes per 100 PHP
    sgdRate: 44.20,
    change24h: -0.08,
    high24h: 44.35,
    low24h: 44.12,
    sparkline: [44.25, 44.30, 44.22, 44.18, 44.15, 44.19, 44.20],
    history30d: generateHistory(44.20, 0.0035),
    popular: true,
  },
  {
    code: 'VND',
    name: 'Vietnamese Dong',
    symbol: '₫',
    country: 'Vietnam',
    flag: '🇻🇳',
    region: 'ASEAN',
    masUnit: 100,
    sgdRate: 19420.00,
    change24h: 0.12,
    high24h: 19450.00,
    low24h: 19380.00,
    sparkline: [19390, 19410, 19400, 19430, 19415, 19405, 19420],
    history30d: generateHistory(19420, 0.003),
    popular: false,
  },

  // Global Majors & Americas
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    country: 'United States',
    flag: '🇺🇸',
    region: 'Americas',
    masUnit: 1,
    sgdRate: 0.7485, // 1 SGD = 0.7485 USD (1 USD = ~1.3360 SGD)
    change24h: -0.22,
    high24h: 0.7510,
    low24h: 0.7470,
    sparkline: [0.7505, 0.7500, 0.7492, 0.7488, 0.7480, 0.7482, 0.7485],
    history30d: generateHistory(0.7485, 0.003),
    popular: true,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    country: 'Eurozone',
    flag: '🇪🇺',
    region: 'Europe',
    masUnit: 1,
    sgdRate: 0.6942, // 1 SGD = ~0.6942 EUR (1 EUR = ~1.4405 SGD)
    change24h: 0.35,
    high24h: 0.6960,
    low24h: 0.6915,
    sparkline: [0.6918, 0.6925, 0.6930, 0.6922, 0.6938, 0.6940, 0.6942],
    history30d: generateHistory(0.6942, 0.0035),
    popular: true,
  },
  {
    code: 'GBP',
    name: 'British Pound Sterling',
    symbol: '£',
    country: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    masUnit: 1,
    sgdRate: 0.5895, // 1 SGD = ~0.5895 GBP (1 GBP = ~1.6963 SGD)
    change24h: -0.18,
    high24h: 0.5920,
    low24h: 0.5880,
    sparkline: [0.5910, 0.5905, 0.5898, 0.5902, 0.5890, 0.5892, 0.5895],
    history30d: generateHistory(0.5895, 0.004),
    popular: true,
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Americas',
    masUnit: 1,
    sgdRate: 1.0410,
    change24h: 0.05,
    high24h: 1.0435,
    low24h: 1.0390,
    sparkline: [1.0395, 1.0402, 1.0408, 1.0415, 1.0405, 1.0412, 1.0410],
    history30d: generateHistory(1.0410, 0.003),
    popular: false,
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    country: 'Switzerland',
    flag: '🇨🇭',
    region: 'Europe',
    masUnit: 1,
    sgdRate: 0.6680,
    change24h: -0.31,
    high24h: 0.6710,
    low24h: 0.6670,
    sparkline: [0.6705, 0.6698, 0.6690, 0.6685, 0.6678, 0.6682, 0.6680],
    history30d: generateHistory(0.6680, 0.003),
    popular: false,
  },

  // Asia-Pacific
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    country: 'Japan',
    flag: '🇯🇵',
    region: 'Asia-Pacific',
    masUnit: 100, // MAS quotes per 100 JPY
    sgdRate: 114.65,
    change24h: 0.68,
    high24h: 115.10,
    low24h: 113.80,
    sparkline: [113.9, 114.1, 114.0, 114.3, 114.4, 114.5, 114.65],
    history30d: generateHistory(114.65, 0.0055),
    popular: true,
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    country: 'China',
    flag: '🇨🇳',
    region: 'Asia-Pacific',
    masUnit: 1,
    sgdRate: 5.4320,
    change24h: -0.04,
    high24h: 5.4410,
    low24h: 5.4280,
    sparkline: [5.435, 5.433, 5.431, 5.430, 5.434, 5.431, 5.432],
    history30d: generateHistory(5.4320, 0.002),
    popular: true,
  },
  {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    symbol: 'HK$',
    country: 'Hong Kong',
    flag: '🇭🇰',
    region: 'Asia-Pacific',
    masUnit: 100, // MAS quotes per 100 HKD
    sgdRate: 5.8450,
    change24h: -0.19,
    high24h: 5.8600,
    low24h: 5.8380,
    sparkline: [5.858, 5.855, 5.850, 5.848, 5.842, 5.844, 5.845],
    history30d: generateHistory(5.8450, 0.0025),
    popular: true,
  },
  {
    code: 'KRW',
    name: 'South Korean Won',
    symbol: '₩',
    country: 'South Korea',
    flag: '🇰🇷',
    region: 'Asia-Pacific',
    masUnit: 100, // MAS quotes per 100 KRW
    sgdRate: 1024.80,
    change24h: 0.52,
    high24h: 1030.00,
    low24h: 1018.50,
    sparkline: [1020, 1022, 1021, 1023, 1022, 1024, 1024.8],
    history30d: generateHistory(1024.8, 0.0045),
    popular: true,
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    country: 'Australia',
    flag: '🇦🇺',
    region: 'Asia-Pacific',
    masUnit: 1,
    sgdRate: 1.1680,
    change24h: 0.44,
    high24h: 1.1710,
    low24h: 1.1620,
    sparkline: [1.163, 1.165, 1.164, 1.166, 1.167, 1.166, 1.168],
    history30d: generateHistory(1.168, 0.0038),
    popular: true,
  },
  {
    code: 'NZD',
    name: 'New Zealand Dollar',
    symbol: 'NZ$',
    country: 'New Zealand',
    flag: '🇳🇿',
    region: 'Asia-Pacific',
    masUnit: 1,
    sgdRate: 1.2840,
    change24h: 0.15,
    high24h: 1.2880,
    low24h: 1.2810,
    sparkline: [1.282, 1.283, 1.281, 1.284, 1.283, 1.285, 1.284],
    history30d: generateHistory(1.284, 0.0035),
    popular: false,
  },
  {
    code: 'TWD',
    name: 'New Taiwan Dollar',
    symbol: 'NT$',
    country: 'Taiwan',
    flag: '🇹🇼',
    region: 'Asia-Pacific',
    masUnit: 100, // MAS quotes per 100 TWD
    sgdRate: 24.32,
    change24h: 0.18,
    high24h: 24.40,
    low24h: 24.25,
    sparkline: [24.27, 24.29, 24.31, 24.28, 24.30, 24.33, 24.32],
    history30d: generateHistory(24.32, 0.003),
    popular: false,
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    country: 'India',
    flag: '🇮🇳',
    region: 'Asia-Pacific',
    masUnit: 100, // MAS quotes per 100 INR
    sgdRate: 63.85,
    change24h: -0.11,
    high24h: 64.02,
    low24h: 63.74,
    sparkline: [63.92, 63.90, 63.88, 63.85, 63.82, 63.84, 63.85],
    history30d: generateHistory(63.85, 0.003),
    popular: true,
  },

  // Middle East
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'Middle East',
    masUnit: 1,
    sgdRate: 2.7485,
    change24h: -0.21,
    high24h: 2.7560,
    low24h: 2.7420,
    sparkline: [2.754, 2.752, 2.750, 2.748, 2.746, 2.747, 2.7485],
    history30d: generateHistory(2.7485, 0.0025),
    popular: false,
  },
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'Middle East',
    masUnit: 100, // MAS quotes per 100 SAR
    sgdRate: 2.8080,
    change24h: -0.18,
    high24h: 2.8150,
    low24h: 2.8020,
    sparkline: [2.812, 2.810, 2.809, 2.807, 2.806, 2.808, 2.808],
    history30d: generateHistory(2.808, 0.0025),
    popular: false,
  },
];
