export interface CarUsageConfig {
  id: number
  pricePerLiterCents: number   // ex: 629 = R$ 6,29
  avgConsumptionCdkm: number   // ex: 1250 = 12,50 km/L
  effectiveFrom: string        // 'YYYY-MM-DD'
  createdAt: string
}

/**
 * Calcula o custo em centavos para uma distância em metros,
 * usando a fórmula: Math.round(pricePerLiterCents * distanceMeters / (avgConsumptionCdkm * 10))
 * Aritmética inteira — sem float.
 */
export function computeCostCents(config: CarUsageConfig, distanceMeters: number): number {
  return Math.round(config.pricePerLiterCents * distanceMeters / (config.avgConsumptionCdkm * 10))
}
