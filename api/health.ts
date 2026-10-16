import type { Request, Response } from 'express';

/**
 * Serverless Health Check Endpoint
 * GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  // Check if MAS API Key is configured in environment
  const masKeyId = process.env.MAS_KEY_ID || process.env.MAS_API_KEY;
  const isMasConfigured = Boolean(masKeyId && masKeyId.trim() !== '');

  const payload = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SingaRate - MAS API Gateway Connection',
    environment: process.env.NODE_ENV || 'development',
    mas_configured: isMasConfigured,
    mas_target_endpoint: 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily',
    endpoints: {
      health: '/api/health',
      exchange_rates: '/api/exchangerates?end_of_day=YYYY-MM-DD',
    },
    uptime: process.uptime(),
  };

  // Support both Express and Node native ServerResponse
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(200).json(payload);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload, null, 2));
}
