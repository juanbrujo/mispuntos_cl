export interface Program {
  id: string
  name: string
  icon: string
  rate: number
  /** Calcula la tasa dinámica según el tipo de cambio USD/CLP.
   *  Si no existe, se usa `rate` fijo. */
  getRate?: (usdRate: number) => number
  color: string
  unit: string
  category?: string
  catColor?: string
  sub?: string
}

export const CATEGORY_LABELS: Record<string, string> = {
  vuelos: 'vuelos',
  retail: 'retail',
  banco: 'banco',
  cashback: 'cashback',
  combustible: 'combustible',
}

export const programs: Program[] = [
  {
    id: 'clp',
    name: 'Pesos Chilenos',
    icon: 'payments',
    rate: 1,
    color: '#003dc7',
    unit: '$'
  },
  {
    id: 'cencosud',
    name: 'Puntos Cencosud',
    icon: 'shopping_bag',
    rate: 1 / 300,           // ← era 2, corregido: 1 pt por cada $1
    color: '#10b981',
    unit: 'pts',
    category: 'retail',
    catColor: '#10b981',
    sub: 'Jumbo · Paris · Easy · Santa Isabel'
  },
  {
    id: 'latam',
    name: 'LATAM Pass',
    icon: 'flight_takeoff',
    rate: 1 / (0.032 * 940), // ← era 0.1, fallback con TC 940 de referencia
    getRate: (usd: number) => 1 / (0.032 * usd),
    color: '#3b82f6',
    unit: 'Mi',
    category: 'vuelos',
    catColor: '#3b82f6',
    sub: 'Millas aéreas · Santander LATAM'
  },
  {
    id: 'lider',
    name: 'Lider Mi Club',
    icon: 'storefront',
    rate: 0.06,        // 6% cashback = $0.06 por CLP
    color: '#22c55e',
    unit: '$',
    category: 'cashback',
    catColor: '#22c55e',
    sub: 'Walmart Chile · Tarjeta Lider Bci'
  },
  {
    id: 'cmr',
    name: 'CMR Puntos',
    icon: 'credit_card',
    rate: 1 / 200,     // ← era 0.142, corregido: 1 pt cada $150 = 0.00667
    color: '#f97316',
    unit: 'pts',
    category: 'retail',
    catColor: '#f97316',
    sub: 'Falabella · Sodimac · Tottus'
  },
  {
    id: 'bchile',
    name: 'Dólares Premio',
    icon: 'currency_exchange',
    rate: 1 / 903, // 1 DP ≈ $903 CLP (canje real en tienda Travel Club)
    color: '#ef4444',
    unit: 'DP$',
    category: 'banco',
    catColor: '#ef4444',
    sub: 'Banco de Chile · Travel Club'
  },
  {
    id: 'ripley',
    name: 'Ripley Puntos',
    icon: 'local_mall',
    rate: 1 / 125,     // ← era 0.125, corregido: 1 pt cada $200 = 0.005
    color: '#8b5cf6',
    unit: 'pts',
    category: 'retail',
    catColor: '#8b5cf6',
    sub: 'Tiendas Ripley · Banco Ripley'
  },
  {
    id: 'sky',
    name: 'SKY Plus',
    icon: 'airplane_ticket',
    rate: 2.5 / 940,   // ← era 0.05, fallback: 2.5 pts/USD ÷ TC 940 = 0.00266
    getRate: (usd: number) => 2.5 / usd,
    color: '#0099cc',
    unit: 'pts',
    category: 'vuelos',
    catColor: '#0099cc',
    sub: 'SKY Airline'
  },
  {
    id: 'itau',
    name: 'Itaú Puntos',
    icon: 'account_balance',
    rate: 1.5 / 350,   // ← era 0.004, corregido: 1.5 pts cada $350 = 0.004286
    color: '#f59e0b',
    unit: 'pts',
    category: 'banco',
    catColor: '#f59e0b',
    sub: 'Banco Itaú Chile'
  },
  {
    id: 'bciplus',
    name: 'BciPlus+',
    icon: 'credit_score',
    rate: 0.01,        // 1% cashback = $0.01 por CLP
    color: '#a855f7',
    unit: '$',
    category: 'cashback',
    catColor: '#a855f7',
    sub: 'Banco BCI · MACH cashback'
  },
  {
    id: 'copec',
    name: 'Full Copec',
    icon: 'local_gas_station',
    rate: 0.01,        // ✓ correcto: 1 pt cada $100
    color: '#f43f5e',
    unit: 'pts',
    category: 'combustible',
    catColor: '#f43f5e',
    sub: 'Copec · Tiendas Pronto'
  }
]
