import type { ICategoryRepository } from '../../domain/category/repository'
import { buildCategory } from '../../domain/category/factory'
import type { Category } from '../../domain/category/model'

export function makeListCategoriesService(repo: ICategoryRepository) {
  return { execute: (): Promise<Category[]> => repo.findAll() }
}

export function makeCreateCategoryService(repo: ICategoryRepository) {
  return {
    execute: async (values: { name: string }): Promise<Category> => {
      const params = buildCategory(values)
      return repo.create(params)
    },
  }
}

export function makeDeleteCategoryService(repo: ICategoryRepository) {
  return { execute: (id: number): Promise<void> => repo.remove(id) }
}
