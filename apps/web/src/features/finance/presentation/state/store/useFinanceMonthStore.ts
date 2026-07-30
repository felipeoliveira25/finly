import { create } from 'zustand'
import { currentMonthISO, addMonths } from '../../utils/format'

interface FinanceMonthState {
  currentMonthKey: string
  goToPreviousMonth: () => void
  goToNextMonth: () => void
}

export const useFinanceMonthStore = create<FinanceMonthState>((set) => ({
  currentMonthKey: currentMonthISO(),
  goToPreviousMonth: () =>
    set((s) => ({ currentMonthKey: addMonths(s.currentMonthKey, -1) })),
  goToNextMonth: () =>
    set((s) => ({ currentMonthKey: addMonths(s.currentMonthKey, 1) })),
}))
