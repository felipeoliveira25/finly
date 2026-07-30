import { HomePage } from '@/features/home/presentation/pages/HomePage'
import { DailyUsagePage } from '@/features/car-usage/presentation/pages/DailyUsagePage/DailyUsagePage'
import { SettingsPage } from '@/features/car-usage/presentation/pages/SettingsPage/SettingsPage'
import { ReportPage } from '@/features/car-usage/presentation/pages/ReportPage/ReportPage'
import { DashboardPage } from '@/features/finance/presentation/pages/DashboardPage/DashboardPage'
import { TransactionsPage } from '@/features/finance/presentation/pages/TransactionsPage/TransactionsPage'
import { SettingsPage as FinanceSettingsPage } from '@/features/finance/presentation/pages/SettingsPage/SettingsPage'
import { ROUTES } from '@/shared/constants/routes'

export const routes = [
  { path: ROUTES.HOME, element: <HomePage /> },
  { path: ROUTES.CAR_USAGE, element: <DailyUsagePage /> },
  { path: ROUTES.CAR_USAGE_SETTINGS, element: <SettingsPage /> },
  { path: ROUTES.CAR_USAGE_REPORT, element: <ReportPage /> },
  { path: ROUTES.FINANCE, element: <DashboardPage /> },
  { path: ROUTES.FINANCE_TRANSACTIONS, element: <TransactionsPage /> },
  { path: ROUTES.FINANCE_SETTINGS, element: <FinanceSettingsPage /> },
]
