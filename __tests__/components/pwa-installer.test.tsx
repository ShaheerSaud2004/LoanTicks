import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PWAInstaller from '@/components/PWAInstaller';

describe('PWAInstaller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not render if already installed', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: true, // Already installed
        media: '(display-mode: standalone)',
      })),
    });

    const { container } = render(<PWAInstaller />);
    expect(container.firstChild).toBeNull();
  });

  it('should show install prompt when beforeinstallprompt event fires', async () => {
    const mockPrompt = vi.fn().mockResolvedValue({ outcome: 'accepted' });
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    render(<PWAInstaller />);

    // Simulate beforeinstallprompt event
    const event = new Event('beforeinstallprompt');
    Object.assign(event, mockEvent);
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByText(/Install LOANATICKS/i)).toBeInTheDocument();
    });
  });

  it('should call prompt when install button is clicked', async () => {
    const mockPrompt = jest.fn().mockResolvedValue({ outcome: 'accepted' });
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    render(<PWAInstaller />);

    // Simulate beforeinstallprompt event
    const event = new Event('beforeinstallprompt');
    Object.assign(event, mockEvent);
    window.dispatchEvent(event);

    await waitFor(() => {
      const installButton = screen.getByText(/Install/i);
      fireEvent.click(installButton);
    });

    expect(mockPrompt).toHaveBeenCalled();
  });

  it('should hide prompt when close button is clicked', async () => {
    const mockEvent = {
      preventDefault: jest.fn(),
      prompt: jest.fn(),
      userChoice: Promise.resolve({ outcome: 'dismissed' }),
    };

    render(<PWAInstaller />);

    // Simulate beforeinstallprompt event
    const event = new Event('beforeinstallprompt');
    Object.assign(event, mockEvent);
    window.dispatchEvent(event);

    await waitFor(() => {
      const closeButton = screen.getByLabelText(/Close/i);
      fireEvent.click(closeButton);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Install LOANATICKS/i)).not.toBeInTheDocument();
    });
  });
});
