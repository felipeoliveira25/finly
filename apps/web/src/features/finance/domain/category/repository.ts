import type { Category } from './model'
import type { CreateCategoryDTO } from '@finly/shared-types'

export interface ICategoryRepository {
  findAll(): Promise<Category[]>
  create(data: CreateCategoryDTO): Promise<Category>
  remove(id: number): Promise<void>
}
