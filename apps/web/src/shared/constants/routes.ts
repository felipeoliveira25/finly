export const ROUTES = {
  HOME: '/',
  CAR_USAGE: '/car-usage',
  CAR_USAGE_SETTINGS: '/car-usage/settings',
  CAR_USAGE_REPORT: '/car-usage/report',
  FINANCE: '/finance',
  FINANCE_TRANSACTIONS: '/finance/transactions',
  FINANCE_SETTINGS: '/finance/settings',
  INVESTMENTS: '/investments',
  HORIZONTE: '/horizonte',
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]
