import { describe, it, expect } from 'vitest';
import '../strip.js';
const S = globalThis.StripSilence;
const ms = 2;
// Build peaks from segments [lengthMs, linear] (null = no clip).
const build = (...segs) => segs.flatMap(([len, v]) => Array(Math.round(len / ms)).fill(v));
const o = { thr: -40, minSil: 100, pre: 4, post: 20 };

describe('detect', () => {
  it('finds a silence between two hits, with margins', () => {
    const p = build([50, 0.5], [300, 0.001], [50, 0.5]);
    const { sil } = S.detect(p, ms, o);
    expect(sil.length).toBe(1);
    const z = sil[0];
    expect(z.a * ms).toBe(50 + 20);          // post margin
    expect(z.b * ms).toBe(350 - 4 - ms);     // pre margin plus one point
    expect(z.before && z.after).toBe(true);
    expect(S.count(sil)).toEqual({ sil: 1, fin: 1, fout: 1 });
  });
  it('bridges silences shorter than the minimum', () => {
    const p = build([50, 0.5], [80, 0.001], [50, 0.5]);
    expect(S.detect(p, ms, o).sil.length).toBe(0);
  });
  it('leading and trailing silence: only one edge each', () => {
    const p = build([200, 0.001], [50, 0.5], [200, 0.001]);
    const { sil } = S.detect(p, ms, o);
    expect(sil.length).toBe(2);
    expect(sil[0]).toMatchObject({ a: 0, before: false, after: true });
    expect(sil[1]).toMatchObject({ before: true, after: false, b: p.length });
    expect(S.count(sil)).toEqual({ sil: 2, fin: 1, fout: 1 });
  });
  it('never marks points with no clip as silence', () => {
    const p = build([50, 0.5], [300, null], [50, 0.5]);
    expect(S.detect(p, ms, o).sil.length).toBe(0);
  });
  it('a clip that is all silence is one silence with no fades', () => {
    const p = build([100, null], [400, 0.0005], [100, null]);
    const { sil } = S.detect(p, ms, o);
    expect(sil.length).toBe(1);
    expect(S.count(sil)).toEqual({ sil: 1, fin: 0, fout: 0 });
  });
  it('threshold decides', () => {
    const p = build([50, 0.5], [300, 0.02], [50, 0.5]); // 0.02 ≈ -34 dB
    expect(S.detect(p, ms, { ...o, thr: -40 }).sil.length).toBe(0);
    expect(S.detect(p, ms, { ...o, thr: -30 }).sil.length).toBe(1);
  });
});
describe('edges', () => {
  it('ignores slivers at a clip edge shorter than the minimum', () => {
    const p = build([50, 0.5], [40, 0.001], [100, null]);
    expect(S.detect(p, ms, { ...o, post: 10 }).sil.length).toBe(0);
  });
});
