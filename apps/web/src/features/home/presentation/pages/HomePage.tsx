import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { HealthCheckResponse } from '@finly/shared-types'
import { apiFetch } from '@/lib/api'
import { ROUTES } from '@/shared/constants/routes'

type ApiStatus = 'loading' | 'connected' | 'offline'

export function HomePage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading')

  useEffect(() => {
    apiFetch<HealthCheckResponse>('/health')
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Logo / título */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="8" fill="#22C55E" fillOpacity="0.15" />
              <path
                d="M16 7C11.03 7 7 11.03 7 16s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm1 13.93V22h-2v-1.07A4.002 4.002 0 0 1 12 17h2c0 1.1.9 2 2 2s2-.9 2-2c0-1.1-.9-2-2-2a4 4 0 0 1-4-4c0-1.86 1.28-3.41 3-3.87V6h2v1.13c1.72.46 3 2.01 3 3.87h-2c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2a4 4 0 0 1 4 4c0 1.86-1.28 3.41-3 3.93z"
                fill="#22C55E"
              />
            </svg>
            <h1 className="text-4xl font-semibold text-text-primary tracking-tight">Finly</h1>
          </div>
          <p className="text-text-secondary text-sm">Controle financeiro pessoal, simples e direto.</p>
        </div>

        {/* Card de status */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <p className="text-text-secondary text-xs uppercase tracking-widest font-medium">
            Status do sistema
          </p>

          <div className="flex items-center justify-center gap-2">
            {apiStatus === 'loading' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-accent-info animate-pulse" />
                <span className="text-accent-info text-sm font-medium">Verificando conexão…</span>
              </>
            )}
            {apiStatus === 'connected' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                <span className="text-accent text-sm font-medium">API conectada</span>
              </>
            )}
            {apiStatus === 'offline' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-accent-negative" />
                <span className="text-accent-negative text-sm font-medium">API offline</span>
              </>
            )}
          </div>
        </div>

        {/* Navegação rápida */}
        <div className="flex flex-col items-center gap-2">
          <Link to={ROUTES.CAR_USAGE} className="text-accent hover:underline text-sm">
            Abrir Controle do Carro →
          </Link>
          <Link to={ROUTES.FINANCE} className="text-accent-info hover:underline text-sm">
            Abrir Gestão Financeira →
          </Link>
          <Link to={ROUTES.INVESTMENTS} className="text-text-secondary hover:underline text-sm">
            Abrir Investimentos →
          </Link>
          <Link to={ROUTES.HORIZONTE} className="text-accent hover:underline text-sm">
            ✈ Abrir Horizonte · Gastos da viagem divididos entre dois →
          </Link>
        </div>

        {/* Rodapé */}
        <p className="text-text-secondary text-xs">
          Ambiente de desenvolvimento &mdash; v0.0.1
        </p>
      </div>
    </main>
  )
}
