import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import jsQR from 'jsqr';
import { decodeQrFromImage } from './parser.js';

vi.mock('jsqr', () => ({
  default: vi.fn()
}));

describe('二维码解析模块', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('从图片 Canvas 像素中解析二维码文本', () => {
    jsQR.mockReturnValue({ data: 'https://example.com' });

    const imageData = {
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    };
    const context = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => imageData)
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context)
    };

    vi.stubGlobal('document', {
      createElement: vi.fn(() => canvas)
    });

    const result = decodeQrFromImage({ width: 1, height: 1 });

    expect(context.drawImage).toHaveBeenCalledOnce();
    expect(jsQR).toHaveBeenCalledWith(imageData.data, 1, 1, {
      inversionAttempts: 'attemptBoth'
    });
    expect(result).toEqual({
      text: 'https://example.com',
      wifi: null
    });
  });

  it('解析失败时返回 null', () => {
    jsQR.mockReturnValue(null);

    const context = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1
      }))
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context)
    };

    vi.stubGlobal('document', {
      createElement: vi.fn(() => canvas)
    });

    expect(decodeQrFromImage({ width: 1, height: 1 })).toBeNull();
  });
});
