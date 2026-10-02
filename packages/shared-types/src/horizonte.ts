export interface TripExpenseDTO {
  id: number
  desc: string
  cat: string
  valorCents: number
  data: string
  parcelas: number
  paid: boolean[]
  createdAt: string
}

export interface CreateTripExpenseDTO {
  desc: string
  cat: string
  valorCents: number
  data: string
  parcelas: number
}

export interface UpdateTripExpensePaidDTO {
  parcelaIndex: number
  paid: boolean
}
