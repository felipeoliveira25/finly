export interface OptionPosition {
  id: number
  underlyingAsset: string
  optionType: string
  strategyLabel: string | null
  quantity: number
  premiumReceivedCents: number
  strikeCents: number
  breakevenCents: number
  popBps: number
  expiryDate: string
  daysToExpiry: number
  isActive: boolean
  createdAt: string
}
