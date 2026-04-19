import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardWalkthrough from '@/components/walkthrough/DashboardWalkthrough';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock document.querySelector
const mockElement = {
    getBoundingClientRect: () => ({
      top: 100,
      left: 100,
      width: 200,
      height: 50,
      bottom: 150,
      right: 300,
    }),
    scrollIntoView: jest.fn(),
};

describe('DashboardWalkthrough', () => {
  const mockOnComplete = jest.fn();

  /** Next is disabled briefly while the walkthrough scroll animation runs. */
  async function clickNextWhenReady() {
    await waitFor(() => {
      const next = screen.getByRole('button', { name: /^Next$/i });
      expect(next).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
  }

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // Mock querySelector
    global.document.querySelector = jest.fn(() => mockElement as any);
    // Mock window methods
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not render if walkthrough already completed', () => {
    localStorageMock.setItem('walkthrough_customer_completed', 'true');
    
    const { container } = render(
      <DashboardWalkthrough role="customer" onComplete={mockOnComplete} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render for customer role', async () => {
    localStorageMock.removeItem('walkthrough_customer_completed');
    
    render(
      <DashboardWalkthrough role="customer" onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome to Your Dashboard/i)).toBeInTheDocument();
    });
  });

  it('should render for employee role', async () => {
    localStorageMock.removeItem('walkthrough_employee_completed');
    
    render(
      <DashboardWalkthrough role="employee" onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome to Employee Dashboard/i)).toBeInTheDocument();
    });
  });

  it('should render for admin role', async () => {
    localStorageMock.removeItem('walkthrough_admin_completed');
    
    render(
      <DashboardWalkthrough role="admin" onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome to Admin Dashboard/i)).toBeInTheDocument();
    });
  });

  it('should show step counter', async () => {
    localStorageMock.removeItem('walkthrough_customer_completed');
    
    render(
      <DashboardWalkthrough role="customer" onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(document.body.textContent).toMatch(/Step\s*1\s*of\s*5/);
    });
  });

  it('should navigate to next step', async () => {
    localStorageMock.removeItem('walkthrough_customer_completed');
    
    render(
      <DashboardWalkthrough role="customer" onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome to Your Dashboard/i)).toBeInTheDocument();
    });

    await clickNextWhenReady();

    await waitFor(() => {
      expect(document.body.textContent).toMatch(/Step\s*2\s*of\s*5/);
    });
  });

  it('should navigate to previous step', async () => {
    localStorageMock.removeItem('walkthrough_customer_completed');
    
    render(
      <DashboardWalkthrough role="customer" onComplete={mockOnComplete} />
    );

    await clickNextWhenReady();

    await waitFor(() => {
      const prevButton = screen.getByRole('button', { name: /Previous/i });
      expect(prevButton).not.toBeDisabled();
      fireEvent.click(prevButton);
    });

    await waitFor(() => {
      expect(document.body.textContent).toMatch(/Step\s*1\s*of\s*5/);
    });
  });

  it('should disable previous button on first step', async () => {
    localStorageMock.removeItem('walkthrough_customer_completed');
    
    render(
      <DashboardWalkthrough role="customer" onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      const prevButton = screen.getByRole('button', { name: /Previous/i });
      expect(prevButton).toBeDisabled();
    });
  });

  it('should show "Got it!" button on last step', async () => {
    localStorageMock.removeItem('walkthrough_customer_completed');
    
    render(
      <DashboardWalkthrough role="customer" onComplete={mockOnComplete} />
    );

    for (let i = 0; i < 4; i++) {
      // eslint-disable-next-line no-await-in-loop
      await clickNextWhenReady();
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Got it!/i })).toBeInTheDocument();
    });
  });

  it('should complete walkthrough when "Got it!" is clicked', async () => {
    localStorageMock.removeItem('walkthrough_customer_completed');
    
    render(
      <DashboardWalkthrough role="customer" onComplete={mockOnComplete} />
    );

    for (let i = 0; i < 4; i++) {
      // eslint-disable-next-line no-await-in-loop
      await clickNextWhenReady();
    }

    await waitFor(() => {
      const gotIt = screen.getByRole('button', { name: /Got it!/i });
      expect(gotIt).toBeInTheDocument();
      expect(gotIt).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /Got it!/i }));

    await waitFor(
      () => {
        expect(localStorageMock.getItem('walkthrough_customer_completed')).toBe('true');
      },
      { timeout: 4000 }
    );
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should skip walkthrough when skip button is clicked', async () => {
    localStorageMock.removeItem('walkthrough_customer_completed');
    
    render(
      <DashboardWalkthrough role="customer" onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      const skipButton = screen.getByText(/Skip tour/i);
      fireEvent.click(skipButton);
    });

    expect(localStorageMock.getItem('walkthrough_customer_completed')).toBe('true');
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should show progress bar', async () => {
    localStorageMock.removeItem('walkthrough_customer_completed');
    
    render(
      <DashboardWalkthrough role="customer" onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      const bars = document.querySelectorAll('.bg-yellow-500.h-2.rounded-full');
      expect(bars.length).toBeGreaterThan(0);
    });
  });
});
