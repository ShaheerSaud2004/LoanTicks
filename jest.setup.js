// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for Next.js server (Request used by NextRequest in Jest)
if (typeof globalThis.Request === 'undefined') {
  try {
    const { Request, Response, Headers } = require('undici');
    globalThis.Request = Request;
    globalThis.Response = Response;
    globalThis.Headers = Headers;
  } catch {
    // Minimal Request stub for tests that import next/server
    class RequestStub {
      constructor(input, init = {}) {
        this.url = typeof input === 'string' ? input : input?.url || '';
        this.method = init.method || 'GET';
        this.headers = new Map(Object.entries(init.headers || {}));
        this.body = init.body;
      }
    }
    globalThis.Request = RequestStub;
  }
}

