import type { Request, Response } from 'express';

const MAS_API_BASE = 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

/**
 * Serverless Exchange Rates Endpoint
 * GET /api/exchangerates?end_of_day=YYYY-MM-DD
 * 
 * MAS API Catalogue:
 * GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14
 * Header:
 * KeyId: <MAS_KEY_ID>
 */
export default async function handler(req: Request, res: Response) {
  // CORS support for serverless deployment
  const origin = req.headers.origin || '*';
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-api-key');
  }

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).end();
    res.statusCode = 200;
    return res.end();
  }

  // 1. Retrieve MAS_KEY_ID from environment or request headers (never hardcoded)
  const masKeyId =
    process.env.MAS_KEY_ID ||
    process.env.MAS_API_KEY ||
    (req.headers['keyid'] as string) ||
    (req.headers['x-api-key'] as string);

  // 2. Resolve end_of_day date query parameter
  // Default to yesterday's date if not supplied (since MAS publishes end_of_day closing rates for past business days)
  let endOfDay = (req.query?.end_of_day as string) || '';
  if (!endOfDay) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    endOfDay = `${yyyy}-${mm}-${dd}`;
  }

  const targetUrl = `${MAS_API_BASE}?end_of_day=${encodeURIComponent(endOfDay)}`;

  // 3. If KeyId is missing, return informative status without throwing
  if (!masKeyId || masKeyId.trim() === '') {
    const payload = {
      success: false,
      configured: false,
      status: 'awaiting_key',
      message: 'MAS_KEY_ID is not configured in environment variables. Please set MAS_KEY_ID in .env or provide a KeyId header.',
      target_endpoint: targetUrl,
      end_of_day: endOfDay,
      instructions: {
        step1: 'Obtain KeyId from Monetary Authority of Singapore (MAS) API Catalogue',
        step2: 'Add MAS_KEY_ID="your_key_here" to your .env file',
        step3: 'Restart or reload serverless instance',
      },
      curl_example: `curl -H "KeyId: <MAS_KEY_ID>" "${targetUrl}"`,
    };

    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(200).json(payload);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(payload, null, 2));
  }

  // 4. Fetch live data from MAS API Gateway
  try {
    const masResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        KeyId: masKeyId.trim(),
        Accept: 'application/json',
        'User-Agent': 'SingaRate-MAS-Client/1.0',
      },
    });

    const contentType = masResponse.headers.get('content-type') || '';
    let responseData: any;

    if (contentType.includes('application/json')) {
      responseData = await masResponse.json();
    } else {
      const rawText = await masResponse.text();
      try {
        responseData = JSON.parse(rawText);
      } catch {
        responseData = { text: rawText };
      }
    }

    if (!masResponse.ok) {
      const errorPayload = {
        success: false,
        configured: true,
        mas_http_status: masResponse.status,
        mas_status_text: masResponse.statusText,
        error: responseData?.message || responseData?.error || 'MAS API request failed',
        endpoint: targetUrl,
        end_of_day: endOfDay,
        details: responseData,
      };

      if (typeof res.status === 'function' && typeof res.json === 'function') {
        return res.status(masResponse.status).json(errorPayload);
      }
      res.statusCode = masResponse.status;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errorPayload, null, 2));
    }

    // Success response forwarding MAS API payload
    const successPayload = {
      success: true,
      configured: true,
      source: 'Monetary Authority of Singapore (MAS) API Catalogue',
      end_of_day: endOfDay,
      timestamp: new Date().toISOString(),
      data: responseData,
    };

    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(200).json(successPayload);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(successPayload, null, 2));
  } catch (err: any) {
    const failurePayload = {
      success: false,
      configured: true,
      error: 'Network or gateway error while connecting to MAS API',
      message: err?.message || String(err),
      target_endpoint: targetUrl,
      end_of_day: endOfDay,
    };

    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(502).json(failurePayload);
    }
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(failurePayload, null, 2));
  }
}
