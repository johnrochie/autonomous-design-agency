// Jest setup file
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Supabase client for tests
jest.mock('@/lib/supabase', () => ({
  supabase: null,
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
  getCurrentUserProfile: jest.fn(),
  resetPassword: jest.fn(),
  getClientProjects: jest.fn(),
  createProject: jest.fn(),
  createClientIntake: jest.fn(),
  getAllProjects: jest.fn(),
  getProjectStats: jest.fn(),
  getProjectById: jest.fn(),
  updateProjectStatus: jest.fn(),
  updateProject: jest.fn(),
  generateProjectQuote: jest.fn(),
  approveQuote: jest.fn(),
  rejectQuote: jest.fn(),
  filterProjects: jest.fn(),
  subscribeToMessages: jest.fn(),
}), { virtual: true });

// Global test utilities
global.IS_TESTING = true;
