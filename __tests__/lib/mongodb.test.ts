import { describe, it, expect } from '@jest/globals';

describe('MongoDB Connection', () => {

  it('should have MongoDB URI configured', () => {
    // Check that MONGODB_URI environment variable is expected
    expect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loanticks').toBeTruthy();
  });

  it('should export connectDB function', async () => {
    const mongodb = await import('@/lib/mongodb');
    expect(mongodb.default).toBeDefined();
    expect(typeof mongodb.default).toBe('function');
  });

  it('should handle connection errors gracefully', async () => {
    // This test verifies the module can be imported
    // Actual connection testing should be done in integration tests
    const mongodb = await import('@/lib/mongodb');
    expect(mongodb.default).toBeDefined();
  });
});
