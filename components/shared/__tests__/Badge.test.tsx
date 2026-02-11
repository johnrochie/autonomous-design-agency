import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  test('renders default variant correctly', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-800');
  });

  test('renders success variant correctly', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  test('renders error variant correctly', () => {
    render(<Badge variant="error">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-800');
  });

  test('renders warning variant correctly', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-800');
  });

  test('renders info variant correctly', () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });

  test('renders with correct structure', () => {
    render(<Badge>Test Content</Badge>);
    const badge = screen.getByText('Test Content');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveClass('inline-flex', 'items-center', 'px-2.5', 'py-0.5', 'rounded-full', 'text-xs', 'font-medium');
  });

  test('renders children correctly', () => {
    const customText = 'Custom Badge Text';
    render(<Badge>{customText}</Badge>);
    expect(screen.getByText(customText)).toBeInTheDocument();
  });
});
