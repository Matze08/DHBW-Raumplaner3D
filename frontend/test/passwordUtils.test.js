import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword } from '../js/passwordUtils.js';

describe('passwordUtils', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with salt using SHA-256', async () => {
      // Arrange
      const password = 'testPassword123';
      const salt = 'test@example.com';
      const expectedHashBuffer = new ArrayBuffer(32); // SHA-256 produces 32 bytes
      const expectedUint8Array = new Uint8Array(expectedHashBuffer);
      // Fill with some test data
      for (let i = 0; i < 32; i++) {
        expectedUint8Array[i] = i;
      }

      // Mock crypto.subtle.digest to return our test hash
      crypto.subtle.digest = vi.fn().mockResolvedValue(expectedHashBuffer);

      // Act
      const result = await hashPassword(password, salt);

      // Assert
      expect(crypto.subtle.digest).toHaveBeenCalledWith('SHA-256', expect.any(Object));
      expect(result).toBe('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64); // SHA-256 hex string is 64 characters
    });

    it('should combine password and salt correctly', async () => {
      // Arrange
      const password = 'myPassword';
      const salt = 'user@test.com';
      const mockHashBuffer = new ArrayBuffer(32);
      const mockUint8Array = new Uint8Array(mockHashBuffer);
      mockUint8Array.fill(255); // Fill with 0xFF

      crypto.subtle.digest = vi.fn().mockResolvedValue(mockHashBuffer);
      const originalTextEncoder = TextEncoder;
      const mockEncode = vi.fn();
      globalThis.TextEncoder = vi.fn().mockImplementation(() => ({
        encode: mockEncode
      }));

      // Act
      await hashPassword(password, salt);

      // Assert
      expect(mockEncode).toHaveBeenCalledWith('myPassworduser@test.com');
      
      // Restore original TextEncoder
      globalThis.TextEncoder = originalTextEncoder;
    });

    it('should return consistent hash for same password and salt', async () => {
      // Arrange
      const password = 'testPassword';
      const salt = 'test@example.com';
      const mockHashBuffer = new ArrayBuffer(32);
      const mockUint8Array = new Uint8Array(mockHashBuffer);
      mockUint8Array.fill(170); // Fill with 0xAA

      crypto.subtle.digest = vi.fn().mockResolvedValue(mockHashBuffer);

      // Act
      const result1 = await hashPassword(password, salt);
      const result2 = await hashPassword(password, salt);

      // Assert
      expect(result1).toBe(result2);
      expect(result1).toBe('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    });

    it('should produce different hashes for different salts', async () => {
      // Arrange
      const password = 'samePassword';
      const salt1 = 'user1@test.com';
      const salt2 = 'user2@test.com';
      
      let callCount = 0;
      crypto.subtle.digest = vi.fn().mockImplementation(() => {
        const buffer = new ArrayBuffer(32);
        const array = new Uint8Array(buffer);
        array.fill(callCount++); // Different values for different calls
        return Promise.resolve(buffer);
      });

      // Act
      const hash1 = await hashPassword(password, salt1);
      const hash2 = await hashPassword(password, salt2);

      // Assert
      expect(hash1).not.toBe(hash2);
      expect(crypto.subtle.digest).toHaveBeenCalledTimes(2);
    });

    it('should handle empty password', async () => {
      // Arrange
      const password = '';
      const salt = 'test@example.com';
      const mockHashBuffer = new ArrayBuffer(32);
      crypto.subtle.digest = vi.fn().mockResolvedValue(mockHashBuffer);

      // Act
      const result = await hashPassword(password, salt);

      // Assert
      expect(crypto.subtle.digest).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });
  });
});
