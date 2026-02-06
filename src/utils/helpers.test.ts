/**
 * Helper Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateId,
  formatDate,
  formatDateISO,
  formatCurrency,
  formatCurrencyValue,
  parseCurrency,
  dollarsToCents,
  centsToDollars,
  truncate,
  capitalize,
  parseTags,
  formatTags,
  isValidEmail,
  isValidPassword,
  isValidAmount,
  calculatePercentChange,
  formatPercentChange,
  getMonthName,
  getMonthNameShort,
} from '@/utils/helpers';

describe('ID Generation', () => {
  it('should generate a unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).toBeDefined();
    expect(id1.length).toBeGreaterThan(0);
    expect(id1).not.toBe(id2);
  });
  
  it('should generate UUID-like format', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });
});

describe('Date Formatting', () => {
  it('should format date to localized string', () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    const formatted = formatDate(date);
    
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });
  
  it('should format date to ISO string', () => {
    const date = new Date(2024, 0, 15);
    const formatted = formatDateISO(date);
    
    expect(formatted).toBe('2024-01-15');
  });
  
  it('should get month name', () => {
    expect(getMonthName(0)).toBe('January');
    expect(getMonthName(11)).toBe('December');
  });
  
  it('should get short month name', () => {
    expect(getMonthNameShort(0)).toBe('Jan');
    expect(getMonthNameShort(11)).toBe('Dec');
  });
});

describe('Currency Formatting', () => {
  it('should format cents to currency string', () => {
    expect(formatCurrency(1050)).toBe('$10.50');
    expect(formatCurrency(100)).toBe('$1.00');
    expect(formatCurrency(0)).toBe('$0.00');
  });
  
  it('should format currency value without dollar sign', () => {
    expect(formatCurrencyValue(1050)).toBe('10.50');
    expect(formatCurrencyValue(1000000)).toBe('10,000.00');
  });
  
  it('should parse currency string to cents', () => {
    expect(parseCurrency('$10.50')).toBe(1050);
    expect(parseCurrency('10.50')).toBe(1050);
    expect(parseCurrency('$1,000.00')).toBe(100000);
  });
  
  it('should convert dollars to cents', () => {
    expect(dollarsToCents(10.50)).toBe(1050);
    expect(dollarsToCents(0.01)).toBe(1);
  });
  
  it('should convert cents to dollars', () => {
    expect(centsToDollars(1050)).toBe(10.50);
    expect(centsToDollars(1)).toBe(0.01);
  });
});

describe('String Utilities', () => {
  it('should truncate long strings', () => {
    expect(truncate('Hello World', 5)).toBe('He...');
    expect(truncate('Hi', 10)).toBe('Hi');
  });
  
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('HELLO')).toBe('HELLO');
  });
  
  it('should parse tags from comma-separated string', () => {
    expect(parseTags('food, groceries, weekly')).toEqual(['food', 'groceries', 'weekly']);
    expect(parseTags('Food, GROCERIES')).toEqual(['food', 'groceries']);
    expect(parseTags('')).toEqual([]);
  });
  
  it('should format tags array to string', () => {
    expect(formatTags(['food', 'groceries'])).toBe('food, groceries');
    expect(formatTags([])).toBe('');
  });
});

describe('Validation', () => {
  it('should validate email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
  });
  
  it('should validate password strength', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });
  
  it('should validate amount', () => {
    expect(isValidAmount(100)).toBe(true);
    expect(isValidAmount(0.01)).toBe(true);
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount(-10)).toBe(false);
    expect(isValidAmount(Infinity)).toBe(false);
  });
});

describe('Percentage Calculations', () => {
  it('should calculate percent change', () => {
    expect(calculatePercentChange(150, 100)).toBe(50);
    expect(calculatePercentChange(50, 100)).toBe(-50);
    expect(calculatePercentChange(100, 100)).toBe(0);
  });
  
  it('should handle zero previous value', () => {
    expect(calculatePercentChange(100, 0)).toBe(100);
    expect(calculatePercentChange(0, 0)).toBe(0);
  });
  
  it('should format percent change with sign', () => {
    expect(formatPercentChange(50)).toBe('+50.0%');
    expect(formatPercentChange(-25.5)).toBe('-25.5%');
    expect(formatPercentChange(0)).toBe('+0.0%');
  });
});
