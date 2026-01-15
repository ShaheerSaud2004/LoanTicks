import { describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

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
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

describe('Upload Documents API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require authentication', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('applicationId', 'test-id');
    formData.append('files', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

    const request = new NextRequest('http://localhost:3000/api/upload-documents', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should require customer role', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-id',
        role: 'admin', // Wrong role
        email: 'admin@test.com',
      },
    } as any);

    const formData = new FormData();
    formData.append('applicationId', 'test-id');
    formData.append('files', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

    const request = new NextRequest('http://localhost:3000/api/upload-documents', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should require applicationId', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-id',
        role: 'customer',
        email: 'customer@test.com',
      },
    } as any);

    const formData = new FormData();
    // No applicationId
    formData.append('files', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

    const request = new NextRequest('http://localhost:3000/api/upload-documents', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Application ID is required');
  });

  it('should validate file size', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-id',
        role: 'customer',
        email: 'customer@test.com',
      },
    } as any);

    const LoanApplication = (await import('@/models/LoanApplication')).default;
    (LoanApplication.findById as jest.Mock).mockResolvedValue({
      userId: 'user-id',
      documents: [],
      save: vi.fn(),
    } as any);

    // Create a file larger than 10MB
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    const formData = new FormData();
    formData.append('applicationId', 'test-id');
    formData.append('files', largeFile);

    const request = new NextRequest('http://localhost:3000/api/upload-documents', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('exceeds 10MB');
  });

  it('should validate file type', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-id',
        role: 'customer',
        email: 'customer@test.com',
      },
    } as any);

    const LoanApplication = (await import('@/models/LoanApplication')).default;
    (LoanApplication.findById as jest.Mock).mockResolvedValue({
      userId: 'user-id',
      documents: [],
      save: vi.fn(),
    } as any);

    // Create an invalid file type
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });

    const formData = new FormData();
    formData.append('applicationId', 'test-id');
    formData.append('files', invalidFile);

    const request = new NextRequest('http://localhost:3000/api/upload-documents', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('invalid type');
  });
});
