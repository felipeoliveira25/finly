export interface HealthCheckResponse {
  status: 'ok' | 'error'
  timestamp: string
  version: string
}
