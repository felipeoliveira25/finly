export interface TripExpense {
  id: number
  desc: string
  cat: string
  valorCents: number
  data: string
  parcelas: number
  paid: boolean[]
  createdAt: string
}

export interface CreateTripExpenseInput {
  desc: string
  cat: string
  valorCents: number
  data: string
  parcelas: number
}

export interface ITripExpenseRepository {
  findAll(): Promise<TripExpense[]>
  create(data: CreateTripExpenseInput): Promise<TripExpense>
  updatePaid(id: number, parcelaIndex: number, paid: boolean): Promise<TripExpense>
  remove(id: number): Promise<void>
}
