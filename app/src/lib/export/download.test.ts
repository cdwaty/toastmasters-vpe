import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile, timestampSuffix } from './download';

describe('downloadFile', () => {
  let createUrlSpy: ReturnType<typeof vi.spyOn>;
  let revokeUrlSpy: ReturnType<typeof vi.spyOn>;
  let clickSpy: ReturnType<typeof vi.spyOn>;
  let appendSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
    revokeUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    appendSpy = vi.spyOn(document.body, 'appendChild');
    removeSpy = vi.spyOn(document.body, 'removeChild');
  });

  afterEach(() => {
    createUrlSpy.mockRestore();
    revokeUrlSpy.mockRestore();
    clickSpy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('creates a blob URL, triggers a click, then revokes', () => {
    downloadFile('export.csv', 'hello,world', 'text/csv');
    expect(createUrlSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeUrlSpy).toHaveBeenCalledWith('blob:fake');
  });

  it('sets filename and href on the anchor before clicking', () => {
    downloadFile('out.txt', 'x', 'text/plain');
    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe('out.txt');
    expect(anchor.href).toContain('blob:fake');
  });

  it('removes the anchor element from the document afterwards', () => {
    downloadFile('out.txt', 'x', 'text/plain');
    expect(removeSpy).toHaveBeenCalled();
  });
});

describe('timestampSuffix', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-09T07:08:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns YYYYMMDD-HHMM format', () => {
    expect(timestampSuffix()).toMatch(/^\d{8}-\d{4}$/);
  });
});
