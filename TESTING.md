# Testing Documentation

## Automated Test Suite

This project includes a comprehensive automated test suite to ensure code quality and prevent regressions before deployment to production.

## Test Framework

- **Jest** - Testing framework
- **React Testing Library** - React component testing
- **Jest DOM** - DOM testing utilities
- **TypeScript** - Type safety (catches errors at build time)

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (limited workers, coverage enabled)
npm run test:ci
```

## Test Categories

### 1. Unit Tests (`components/__tests__/`, `lib/__tests__/`)

Tests individual components and functions in isolation.

**Current Coverage:**
- ✅ `Badge` component (all variants, 100% coverage)
- ✅ `quote-generator` functions (100% coverage)

**Examples:**
- Component rendering with different props
- Function output validation
- Edge case handling
- Error scenarios

### 2. Integration Tests (`integration/__tests__/`)

Tests complete user flows and feature combinations.

**Current Coverage:**
- ✅ Client intake flow (form → quote generation)
- ✅ Simple vs complex feature pricing
- ✅ Different project types pricing
- ✅ Feature complexity assessment

**What's Tested:**
- End-to-end user workflows
- Multi-component interactions
- Business logic validation
- Data flow through the system

### 3. E2E Tests (Future)

Full browser-based tests for complete user journeys.

**Status:** Not yet implemented - planned for Phase 4

**Will Cover:**
- Complete signup → intake → quote → approve flow
- Admin dashboard interactions
- Cross-browser compatibility
- Mobile responsiveness

## Pre-Commit Hooks

Git hooks are configured to run tests automatically before commits:

```bash
# Pre-commit hook runs:
npm test -- --passWithNoTests
```

If tests fail, the commit is blocked. Fix failing tests before committing.

## GitHub Actions CI/CD

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request to `main` or `develop`

**Workflow:** `.github/workflows/tests.yml`
- Checks out code
- Installs dependencies
- Runs full test suite with coverage
- Uploads coverage to Codecov

**CI Status:** Runs on GitHub Actions → Actions tab

## Coverage Reports

Generate and view coverage:

```bash
npm run test:coverage
```

Reports generated in `coverage/` directory:
- `index.html` - Browser-based coverage viewer
- `lcov.info` - Coverage data for CI/CD

**Target Coverage Goals:**
- Critical business logic (routes): 90%+
- Components: 80%+
- Utilities/libraries: 95%+
- Overall: 70%+

**Current Status (2026-02-11):**
- All files: 12.01% (initial setup)
- Badge component: 100% ✅
- quote-generator: 100% ✅
- Supabase client: 0% (needs tests)
- Auth logic: 0% (needs tests)
- Page components: 0% (needs tests)

## Test Structure

```
autonomous-design-agency/
├── components/
│   └── **/__tests__/          # Component unit tests
│       └── Badge.test.tsx
├── lib/
│   └── __tests__/            # Library function tests
│       └── quote-generator.test.ts
├── app/
│   └── __tests__/            # Page component tests
│       └── (future)
└── integration/
    └── __tests__/            # Integration tests
        └── client-intake-flow.test.ts
```

## Writing New Tests

### Component Test Example:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Function Test Example:

```typescript
import { myFunction } from '../myModule';

describe('myFunction', () => {
  test('returns expected output', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Integration Test Example:

```typescript
describe('Integration: User Flow', () => {
  test('complete flow works end-to-end', async () => {
    // Step 1: Setup
    const data = { ... };

    // Step 2: Execute
    const result = await processFlow(data);

    // Step 3: Validate
    expect(result).toBeDefined();
  });
});
```

## Key Test Files

| File | Purpose | Coverage |
|------|---------|----------|
| `components/shared/__tests__/Badge.test.tsx` | Badge component variants | 100% |
| `lib/__tests__/quote-generator.test.ts` | Quote calculation logic | 100% |
| `integration/__tests__/client-intake-flow.test.ts` | Intake-to-quote flow | Full flow |
| `jest.config.js` | Jest configuration | - |
| `jest.setup.js` | Test environment setup | - |
| `.github/workflows/tests.yml` | CI/CD pipeline | - |

## Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
test('example', () => {
  // Arrange: Setup test data and conditions
  const input = { ... };

  // Act: Execute the function or component
  const result = myFunction(input);

  // Assert: Verify the outcome
  expect(result).toEqual(expected);
});
```

### 2. Test User Behavior, Not Implementation

**Good:**
```typescript
screen.getByRole('button', { name: 'Submit' })
```

**Avoid:**
```typescript
screen.getByClassName('btn-primary')
```

### 3. Test Edge Cases

```typescript
test('handles empty input', () => {
  expect(myFunction('')).toBe('default');
});

test('handles null input', () => {
  expect(myFunction(null)).toBe('default');
});
```

### 4. Keep Tests Independent

Each test should:
- Run independently of others
- Not rely on test execution order
- Clean up after itself

## Running Specific Tests

```bash
# Run single test file
npm test Badge.test.tsx

# Run tests matching a pattern
npm test -- --testPathPattern="quote"

# Run tests in watch mode matching a file
npm run test:watch -- --testPathPattern="Badge"
```

## Mocking

External dependencies (Supabase, APIs, etc.) are mocked in `jest.setup.js`:

```javascript
jest.mock('@/lib/supabase', () => ({
  supabase: null,
  signUp: jest.fn(),
  // ...
}));
```

**Why Mock:**
- Tests run without external dependencies
- Faster execution
- No side effects in test environment

## Debugging Failed Tests

### 1. Run with verbose output

```bash
npm test -- --verbose
```

### 2. Run single test file

```bash
npm test -- quote-generator.test.ts
```

### 3. Use `.only` to run a specific test

```typescript
test.only('this test only', () => {
  // This test will run exclusively
});
```

### 4. Check Jest configuration

Ensure `jest.config.js` and `jest.setup.js` are properly configured.

## Future Testing Goals

### Phase 3 (Current):
- ✅ Jest + React Testing Library setup
- ✅ Unit tests for critical components
- ✅ Integration tests for core flows
- ✅ CI/CD pipeline with GitHub Actions
- ⏳ Pre-commit hooks enforcement

### Phase 4 (Next):
- [ ] E2E tests with Playwright or Cypress
- [ ] Supabase integration tests (with test database)
- [ ] Admin dashboard component tests
- [ ] Auth flow integration tests
- [ ] Quote approval/rejection flow tests
- [ ] Client portal component tests

### Phase 5:
- [ ] Performance tests
- [ ] Load testing
- [ ] Accessibility tests (with axe-core)
- [ ] Visual regression tests

## Maintenance

### Regular Tasks:
- Run test suite before each deployment
- Review coverage reports monthly
- Update tests when features change
- Remove obsolete tests

### Adding New Features:
1. Write tests first (TDD) or alongside code
2. Ensure new code has tests
3. Aim for 80%+ coverage on new code
4. Update this documentation

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Summary

**Test Suite Status:** ✅ Active (25 tests passing)
**CI/CD:** ✅ GitHub Actions configured
**Coverage Monitoring:** ✅ Enabled
**Pre-commit Hooks:** ✅ Configured (local enforcement)
**Roadmap:** Sprint 4 & 5 will add component and page tests

**Bottom line:** All code commits must pass tests before production deployment. This ensures no regressions reach customers.
