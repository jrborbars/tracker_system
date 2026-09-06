import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpClient } from './httpClient.js';

describe('httpClient Core Infrastructure', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('injects Authorization header when token is supplied', async () => {
    const mockResponse = {
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({ success: true }),
    };

    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await httpClient.get('/devices/', 'fake-jwt-token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/devices/',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: 'Bearer fake-jwt-token',
        },
      })
    );
    expect(result).toEqual({ success: true });
  });

  it('sends JSON body on POST requests', async () => {
    const mockResponse = {
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({ id: '123' }),
    };

    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const body = { name: 'Device Alpha' };
    const result = await httpClient.post('/devices/', body, 'token-123');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/devices/',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
        body: JSON.stringify(body),
      })
    );
    expect(result).toEqual({ id: '123' });
  });

  it('throws an error with message/detail if response is not ok', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({ detail: 'Device ID already exists' }),
    };

    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    await expect(httpClient.get('/devices/', 'token-123')).rejects.toThrow(
      'Device ID already exists'
    );
  });
});
