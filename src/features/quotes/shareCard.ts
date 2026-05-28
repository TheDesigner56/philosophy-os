import { Quote } from '@/types';
import { BRAND } from '@/lib/brand';

// Renders a branded square share card to a PNG blob. Every card carries the app
// name + IG handle — shares become free distribution (the IG flywheel).
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function renderShareCard(quote: Quote): Promise<Blob | null> {
  const size = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);

  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, size, size);

  const margin = 120;
  ctx.fillStyle = '#F5F5F5';
  ctx.font = '500 58px Georgia, "Times New Roman", serif';
  ctx.textBaseline = 'top';
  const lines = wrapLines(ctx, `“${quote.text}”`, size - margin * 2);
  const lineHeight = 78;
  const blockHeight = lines.length * lineHeight;
  let y = (size - blockHeight) / 2 - 40;
  for (const line of lines) {
    ctx.fillText(line, margin, y);
    y += lineHeight;
  }

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = 'italic 36px Georgia, serif';
  ctx.fillText(`— ${quote.author}`, margin, y + 24);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '600 30px -apple-system, system-ui, sans-serif';
  ctx.fillText(BRAND.appName, margin, size - margin);
  ctx.textAlign = 'right';
  ctx.fillText(BRAND.igHandle, size - margin, size - margin);
  ctx.textAlign = 'left';

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}

export async function shareQuote(quote: Quote): Promise<void> {
  const blob = await renderShareCard(quote);
  const text = `“${quote.text}” — ${quote.author}`;
  if (blob) {
    const file = new File([blob], 'stoic-os.png', { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], text });
        return;
      } catch {
        // user cancelled or share failed — fall through to download
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stoic-os.png';
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  if (navigator.share) {
    try {
      await navigator.share({ text });
    } catch {
      /* cancelled */
    }
  }
}
