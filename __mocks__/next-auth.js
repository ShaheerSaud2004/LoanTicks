// Mock next-auth/react for testing
module.exports = {
  signOut: jest.fn(() => Promise.resolve({ url: '/login' })),
  signIn: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  SessionProvider: ({ children }) => children,
};

