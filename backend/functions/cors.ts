// Shared CORS utility for Lambda functions

const allowedOrigins = [
  'http://localhost:5173',
  'https://d1cvbfxrk26ua1.cloudfront.net', // Add your CloudFront domain(s) here
];

export function getCorsHeaders(origin?: string) {
  const allowed = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };
} 