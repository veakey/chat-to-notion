/**
 * Tests pour le hook useChatForm
 */
import { renderHook } from '@testing-library/react';
import { useChatForm } from '../../hooks/useChatForm';
import axios from 'axios';

jest.mock('axios');

describe('useChatForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    axios.get.mockResolvedValue({
      data: { properties: [], additionalProperties: {} }
    });

    const { result } = renderHook(() => useChatForm(false));

    expect(result.current.content).toBe('');
    expect(result.current.date).toBeTruthy();
    expect(result.current.loading).toBe(false);
  });

  it('should have correct structure', () => {
    axios.get.mockResolvedValue({
      data: { properties: [], additionalProperties: {} }
    });

    const { result } = renderHook(() => useChatForm(false));

    expect(result.current).toHaveProperty('content');
    expect(result.current).toHaveProperty('setContent');
    expect(result.current).toHaveProperty('date');
    expect(result.current).toHaveProperty('setDate');
    expect(result.current).toHaveProperty('availableProperties');
    expect(result.current).toHaveProperty('selectedProperties');
  });
});

