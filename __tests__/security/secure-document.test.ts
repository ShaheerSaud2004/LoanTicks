import { describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string;
    headers: Map<string, string>;
    
    constructor(url: string) {
      this.url = url;
      this.headers = new Map();
    }
    
    headers = {
      get: jest.fn((name: string) => {
        if (name === 'x-forwarded-for') return '127.0.0.1';
        if (name === 'user-agent') return 'test-agent';
        return null;
      }),
    };
  },
  NextResponse: {
    json: jest.fn((data: any, options?: any) => ({
      status: options?.status || 200,
      json: async () => data,
      headers: new Map(),
    })),
    next: jest.fn(() => ({
      status: 200,
      headers: new Map(),
    })),
  },
}));

// Mock dependencies
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/mongodb', () => ({
  default: jest.fn(),
}));

jest.mock('@/models/LoanApplication', () => ({
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

jest.mock('@/lib/auditLogger', () => ({
  logDataAccess: jest.fn(),
}));

describe('Secure Document API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require authentication', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/secure-document?applicationId=123&fileName=test.pdf');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should require applicationId and fileName', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-id',
        role: 'customer',
        email: 'customer@test.com',
      },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/secure-document');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Application ID and file name are required');
  });

  it('should check user permissions', async () => {
    const { auth } = await import('@/lib/auth');
    const LoanApplication = (await import('@/models/LoanApplication')).default;
    
    (auth as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-id',
        role: 'customer',
        email: 'customer@test.com',
      },
    } as any);

    (LoanApplication.findById as jest.Mock).mockResolvedValue({
      userId: 'different-user-id',
      documents: [{
        storedName: 'test.pdf',
        name: 'test.pdf',
      }],
    });

    const request = new NextRequest('http://localhost:3000/api/secure-document?applicationId=123&fileName=test.pdf');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Unauthorized');
  });

  it('should allow access for application owner', async () => {
    const { auth } = await import('@/lib/auth');
    const LoanApplication = (await import('@/models/LoanApplication')).default;
    const { readFile } = await import('fs/promises');
    
    (auth as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-id',
        role: 'customer',
        email: 'customer@test.com',
      },
    } as any);

    (LoanApplication.findById as jest.Mock).mockResolvedValue({
      userId: 'user-id',
      documents: [{
        storedName: 'test.pdf',
        name: 'test.pdf',
        type: 'application/pdf',
      }],
    });

    (readFile as jest.Mock).mockResolvedValue(Buffer.from('PDF content'));

    const request = new NextRequest('http://localhost:3000/api/secure-document?applicationId=123&fileName=test.pdf');

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('should allow access for employees', async () => {
    const { auth } = await import('@/lib/auth');
    const LoanApplication = (await import('@/models/LoanApplication')).default;
    const { readFile } = await import('fs/promises');
    
    (auth as jest.Mock).mockResolvedValue({
      user: {
        id: 'employee-id',
        role: 'employee',
        email: 'employee@test.com',
      },
    } as any);

    (LoanApplication.findById as jest.Mock).mockResolvedValue({
      userId: 'different-user-id',
      documents: [{
        storedName: 'test.pdf',
        name: 'test.pdf',
        type: 'application/pdf',
      }],
    });

    (readFile as jest.Mock).mockResolvedValue(Buffer.from('PDF content'));

    const request = new NextRequest('http://localhost:3000/api/secure-document?applicationId=123&fileName=test.pdf');

    const response = await GET(request);

    expect(response.status).toBe(200);
  });
});
