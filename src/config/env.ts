/**
 * Environment configuration
 * Centralizes all environment variables and configuration
 */

interface AppConfig {
  basePath: string;
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
  analytics: {
    enabled: boolean;
    websiteId?: string;
  };
}

function getEnvironment(): 'development' | 'staging' | 'production' {
  const env = import.meta.env.MODE;
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
}

export const config: AppConfig = {
  basePath: import.meta.env.VITE_BASE || '/',
  environment: getEnvironment(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  analytics: {
    enabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true' || import.meta.env.PROD,
    websiteId: import.meta.env.VITE_ANALYTICS_WEBSITE_ID,
  },
} as const;

/**
 * Get the full URL for a question file
 */
export function getQuestionFileUrl(filename: string): string {
  const base = config.basePath.endsWith('/') ? config.basePath : `${config.basePath}/`;
  return `${base}${filename}`;
}

/**
 * Log configuration in development
 */
if (config.isDevelopment) {
  console.log('App Configuration:', {
    basePath: config.basePath,
    environment: config.environment,
    analytics: config.analytics.enabled ? 'enabled' : 'disabled',
  });
}
