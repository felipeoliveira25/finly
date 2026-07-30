import type { CategoryDTO } from '@finly/shared-types'
import type { Category } from './model'

interface CreateCategoryParams {
  name: string
}

interface CategoryFormValues {
  name: string
}

/**
 * Constrói os dados de uma nova categoria a partir do input do usuário.
 * Valida as regras de negócio — lança Error se o estado for inválido.
 */
export function createCategory(params: CreateCategoryParams): Pick<Category, 'name'> {
  if (params.name.trim() === '') {
    throw new Error('Nome da categoria não pode ser vazio')
  }

  return { name: params.name.trim() }
}

/**
 * Transforma um CategoryDTO vindo da API em entidade de domínio.
 * Não valida — confia que a API já validou os dados.
 */
export function hydrateCategory(dto: CategoryDTO): Category {
  return {
    id: dto.id,
    name: dto.name,
    isSystem: dto.isSystem,
    createdAt: dto.createdAt,
  }
}

/**
 * Normaliza os valores brutos do formulário e retorna os CreateCategoryParams validados.
 */
export function buildCategory(values: CategoryFormValues): CreateCategoryParams {
  return createCategory({ name: values.name.trim() })
}
