import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleLogin, handleAutoLogout } from '../js/login.js';

// Mock the passwordUtils module
vi.mock('../js/passwordUtils.js', () => ({
  hashPassword: vi.fn()
}));

import { hashPassword } from '../js/passwordUtils.js';

describe('login', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('handleAutoLogout', () => {
    it('should remove user from localStorage when user is logged in', () => {
      // Arrange
      localStorage.getItem = vi.fn().mockReturnValue('{"id": 1, "email": "test@example.com"}');
      localStorage.removeItem = vi.fn();

      // Act
      const result = handleAutoLogout();

      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith('user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(result).toBe(true);
    });

    it('should not remove user from localStorage when no user is logged in', () => {
      // Arrange
      localStorage.getItem = vi.fn().mockReturnValue(null);
      localStorage.removeItem = vi.fn();

      // Act
      const result = handleAutoLogout();

      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith('user');
      expect(localStorage.removeItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('handleLogin', () => {
    let mockErrorElement;

    beforeEach(() => {
      // Create a mock error element
      mockErrorElement = {
        textContent: '',
        style: { display: 'none' }
      };
    });

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const mockUser = { id: 1, email: 'test@example.com' };

      hashPassword.mockResolvedValue(hashedPassword);
      fetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ user: mockUser })
      });
      localStorage.setItem = vi.fn();
      window.location = { href: '' };

      // Act
      const result = await handleLogin(email, password, mockErrorElement);

      // Assert
      expect(hashPassword).toHaveBeenCalledWith(password, email);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: hashedPassword,
        }),
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(window.location.href).toBe('root.html');
      expect(alert).toHaveBeenCalledWith('Erfolgreich eingeloggt!');
      expect(result).toBe(true);
    });

    it('should handle login failure with error message from server', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashed_password';
      const errorMessage = 'Invalid credentials';

      hashPassword.mockResolvedValue(hashedPassword);
      fetch.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: errorMessage })
      });

      // Act
      const result = await handleLogin(email, password, mockErrorElement);

      // Assert
      expect(mockErrorElement.textContent).toBe(errorMessage);
      expect(mockErrorElement.style.display).toBe('block');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(window.location.href).toBe('');
      expect(result).toBe(false);
    });

    it('should handle login failure without error message from server', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashed_password';

      hashPassword.mockResolvedValue(hashedPassword);
      fetch.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}) // No message in response
      });

      // Act
      const result = await handleLogin(email, password, mockErrorElement);

      // Assert
      expect(mockErrorElement.textContent).toBe('Login fehlgeschlagen');
      expect(mockErrorElement.style.display).toBe('block');
      expect(result).toBe(false);
    });

    it('should handle network errors', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      hashPassword.mockResolvedValue('hashed_password');
      fetch.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await handleLogin(email, password, mockErrorElement);

      // Assert
      expect(mockErrorElement.textContent).toBe('Netzwerkfehler. Bitte versuche es später erneut.');
      expect(mockErrorElement.style.display).toBe('block');
      expect(console.error).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle password hashing errors', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      hashPassword.mockRejectedValue(new Error('Hashing failed'));

      // Act
      const result = await handleLogin(email, password, mockErrorElement);

      // Assert
      expect(mockErrorElement.textContent).toBe('Netzwerkfehler. Bitte versuche es später erneut.');
      expect(mockErrorElement.style.display).toBe('block');
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should trim email input', async () => {
      // Arrange
      const email = '  test@example.com  ';
      const password = 'password123';
      const hashedPassword = 'hashed_password';

      hashPassword.mockResolvedValue(hashedPassword);
      fetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ user: { id: 1, email: 'test@example.com' } })
      });

      // Act
      await handleLogin(email, password, mockErrorElement);

      // Assert
      expect(hashPassword).toHaveBeenCalledWith(password, email.trim());
    });
  });
});
