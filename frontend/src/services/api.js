import { MOCK_SUCCESS_RESPONSE, MOCK_ERROR_RESPONSE } from '../data/mockCompilation';

// API Service abstraction layer
// Set to true to use backend endpoint when available, defaults to mock data for MVP
const USE_REAL_BACKEND = false;
const BACKEND_BASE_URL = 'http://localhost:8000';

export async function compileCode(filename, code) {
  if (USE_REAL_BACKEND) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, code }),
      });
      return await res.json();
    } catch (err) {
      console.error('Backend connection error, falling back to mock response', err);
    }
  }

  // Mock API delay simulation (200ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  // If code contains missing semicolon or "error", return mock error response
  if (code.includes('error') || (code.includes('int a = 10') && !code.includes('int a = 10;'))) {
    return MOCK_ERROR_RESPONSE;
  }

  // Return success response with custom code in source stage
  return {
    ...MOCK_SUCCESS_RESPONSE,
    filename: filename || 'sum.c',
    stages: {
      ...MOCK_SUCCESS_RESPONSE.stages,
      source: {
        ...MOCK_SUCCESS_RESPONSE.stages.source,
        file: filename || 'sum.c',
        content: code,
      },
    },
  };
}
