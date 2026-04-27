/**
 * Health check module types
 */

/**
 * System health information
 */
export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version?: string;
}

/**
 * Database health information
 */
export interface DatabaseHealth {
  status: 'connected' | 'disconnected' | 'error';
  latency?: number;
  error?: string;
}

/**
 * Service health check result
 */
export interface ServiceHealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  responseTime?: number;
}

/**
 * Complete health check result
 */
export interface HealthCheckResult {
  system: SystemHealth;
  database?: DatabaseHealth;
  services: ServiceHealthCheck[];
}
