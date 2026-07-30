import { apiFetch } from '@/lib/api'
import type { CategoryDTO, CreateCategoryDTO } from '@finly/shared-types'
import { hydrateCategory } from '../../../../domain/category/factory'
import type { ICategoryRepository } from '../../../../domain/category/repository'

export function makeCategoryHttpRepository(): ICategoryRepository {
  return {
    findAll: async () => {
      const dtos = await apiFetch<CategoryDTO[]>('/finance/categories')
      return dtos.map(hydrateCategory)
    },
    create: async (data: CreateCategoryDTO) => {
      const dto = await apiFetch<CategoryDTO>('/finance/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return hydrateCategory(dto)
    },
    remove: async (id: number) => {
      await apiFetch<void>(`/finance/categories/${id}`, { method: 'DELETE' })
    },
  }
}
