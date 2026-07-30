import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

// Configuração versionada: nunca sobrescrever, sempre INSERT.
// A config ativa para uma data D é aquela com maior effective_from <= D.
export const carUsageConfigs = sqliteTable('car_usage_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pricePerLiterCents: integer('price_per_liter_cents').notNull(), // ex: 629 = R$ 6,29
  avgConsumptionCdkm: integer('avg_consumption_cdkm').notNull(), // ex: 1250 = 12,50 km/L
  effectiveFrom: text('effective_from').notNull(),                // 'YYYY-MM-DD'
  createdAt: text('created_at').notNull(),
})

// Trajetos fixos reutilizáveis (ex: "Casa → Ferreira Costa", 8 km)
export const fixedRoutes = sqliteTable('fixed_routes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  distanceMeters: integer('distance_meters').notNull(), // ex: 8000 = 8 km
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

// Períodos de reembolso fechados (somente-leitura após criação)
export const reimbursementPeriods = sqliteTable('reimbursement_periods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull(),           // ex: "Julho 2025"
  startDate: text('start_date').notNull(),  // 'YYYY-MM-DD'
  endDate: text('end_date').notNull(),      // 'YYYY-MM-DD'
  totalKmMeters: integer('total_km_meters').notNull(),  // denormalizado ao fechar
  totalCostCents: integer('total_cost_cents').notNull(), // denormalizado ao fechar
  closedAt: text('closed_at').notNull(),    // timestamp do fechamento (UTC ISO 8601)
  createdAt: text('created_at').notNull(),
})

// ─── Finance ─────────────────────────────────────────────────────────────────

// Categorias: pré-definidas (is_system=1, não deletáveis) + criadas pelo usuário
export const financeCategories = sqliteTable('finance_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
})

// Modelos de lançamentos recorrentes (templates mensais)
export const recurringTransactionModels = sqliteTable('recurring_transaction_models', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  categoryId: integer('category_id').notNull().references(() => financeCategories.id),
  defaultAmountCents: integer('default_amount_cents').notNull(),
  dayOfMonth: integer('day_of_month').notNull(), // 1–31; se > último dia do mês, usa o último
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

// Todos os lançamentos: recorrentes gerados + avulsos
// recurring_model_id = null → avulso
// is_confirmed = 0 → gerado automaticamente, aguarda confirmação do usuário
// is_confirmed = 1 → confirmado (avulsos nascem confirmados)
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  categoryId: integer('category_id').notNull().references(() => financeCategories.id),
  amountCents: integer('amount_cents').notNull(),
  description: text('description'),
  date: text('date').notNull(),      // 'YYYY-MM-DD'
  monthKey: text('month_key').notNull(), // 'YYYY-MM'
  recurringModelId: integer('recurring_model_id').references(
    () => recurringTransactionModels.id,
    { onDelete: 'set null' },
  ),
  isConfirmed: integer('is_confirmed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

// ─── Car Usage ───────────────────────────────────────────────────────────────

// Registros diários de uso — cada trajeto é uma linha
// period_id NOT NULL = pertence a período fechado (somente-leitura)
export const carTrips = sqliteTable('car_trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),                          // 'YYYY-MM-DD'
  fixedRouteId: integer('fixed_route_id').references(() => fixedRoutes.id),  // null = avulso
  distanceMeters: integer('distance_meters').notNull(),
  description: text('description'),                      // opcional, para avulsos
  configId: integer('config_id').notNull().references(() => carUsageConfigs.id),
  costCents: integer('cost_cents').notNull(),             // calculado e imutável
  periodId: integer('period_id').references(() => reimbursementPeriods.id),  // null = editável
  createdAt: text('created_at').notNull(),
})
