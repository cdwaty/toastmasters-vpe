import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { log } from './logger';

let infoSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  infoSpy.mockRestore();
  warnSpy.mockRestore();
  errorSpy.mockRestore();
  log.setUser(null);
  log.setContext('orgId', undefined);
});

describe('log', () => {
  it('info logs to console.info in dev', () => {
    log.info('hello');
    expect(infoSpy).toHaveBeenCalled();
  });

  it('warn logs to console.warn in dev', () => {
    log.warn({ foo: 1 }, 'something');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('error logs to console.error', () => {
    log.error('boom');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('accepts context object + message form', () => {
    log.info({ requestId: 'abc' }, 'fetched');
    const call = infoSpy.mock.calls[0];
    expect(call[0]).toContain('fetched');
    expect(call[1]).toMatchObject({ requestId: 'abc' });
  });

  it('setUser adds userId to session context', () => {
    log.setUser('u1');
    log.info('after set');
    expect(infoSpy.mock.calls[0][1]).toMatchObject({ userId: 'u1' });
  });

  it('setUser(null) removes userId from session context', () => {
    log.setUser('u1');
    log.setUser(null);
    log.info('after clear');
    expect(infoSpy.mock.calls[0][1]).not.toHaveProperty('userId');
  });

  it('setContext sets and clears arbitrary keys', () => {
    log.setContext('orgId', 'org-1');
    log.info('with org');
    expect(infoSpy.mock.calls[0][1]).toMatchObject({ orgId: 'org-1' });

    log.setContext('orgId', undefined);
    log.info('cleared');
    expect(infoSpy.mock.calls[1][1]).not.toHaveProperty('orgId');
  });
});
