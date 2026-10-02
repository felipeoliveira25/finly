import { apiFetch } from '@/lib/api'
import type { TripExpenseDTO } from '@finly/shared-types'
import { hydrateTripExpense } from '@/features/horizonte/domain/tripExpense/factory'
import type { ITripExpenseRepository, TripExpense, CreateTripExpenseInput } from '@/features/horizonte/domain/tripExpense/model'

export function makeTripExpenseHttpRepository(): ITripExpenseRepository {
  return {
    findAll: async (): Promise<TripExpense[]> => {
      const dtos = await apiFetch<TripExpenseDTO[]>('/horizonte')
      return dtos.map(hydrateTripExpense)
    },

    create: async (data: CreateTripExpenseInput) => {
      const dto = await apiFetch<TripExpenseDTO>('/horizonte', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return hydrateTripExpense(dto)
    },

    updatePaid: async (id: number, parcelaIndex: number, paid: boolean) => {
      const dto = await apiFetch<TripExpenseDTO>(`/horizonte/${id}/paid`, {
        method: 'PATCH',
        body: JSON.stringify({ parcelaIndex, paid }),
      })
      return hydrateTripExpense(dto)
    },

    remove: async (id: number): Promise<void> => {
      await apiFetch<void>(`/horizonte/${id}`, { method: 'DELETE' })
    },
  }
}
