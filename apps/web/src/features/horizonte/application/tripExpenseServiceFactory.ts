import type { ITripExpenseRepository, TripExpense, CreateTripExpenseInput } from '../domain/tripExpense/model'
import { buildCreateInput } from '../domain/tripExpense/factory'

interface TripExpenseFormValues {
  desc: string
  cat: string
  valorReais: string
  data: string
  parcelas: string
}

export function makeListTripExpensesService(repo: ITripExpenseRepository) {
  return {
    execute: (): Promise<TripExpense[]> => repo.findAll(),
  }
}

export function makeCreateTripExpenseService(repo: ITripExpenseRepository) {
  return {
    execute: async (form: TripExpenseFormValues): Promise<TripExpense> => {
      const input: CreateTripExpenseInput = buildCreateInput(form)
      return repo.create(input)
    },
  }
}

export function makeUpdatePaidService(repo: ITripExpenseRepository) {
  return {
    execute: (id: number, parcelaIndex: number, paid: boolean): Promise<TripExpense> =>
      repo.updatePaid(id, parcelaIndex, paid),
  }
}

export function makeRemoveTripExpenseService(repo: ITripExpenseRepository) {
  return {
    execute: (id: number): Promise<void> => repo.remove(id),
  }
}
