// Fades: Strip Silence, the detection, as pure functions. No LUNA here.
//
// The page samples each track's waveform overview (LUNA's fine overview: one peak pair per
// ~2.6 ms) on an even grid of points `ms` apart over the span; `peaks[i]` is the linear peak at
// point i, or null where no clip plays. From that we find what sounds and what is silence:
//   1. a point sounds when its peak is over the threshold;
//   2. silences shorter than the minimum are bridged (a breath between words, a drum's ring);
//   3. each sounding stretch grows by the margins: before (plus one point, since the overview
//      can place an attack up to one point late) and after (the tail);
//   4. what is left, where a clip plays, is silence to remove.
// Each silence knows whether audio sounds right before and right after it: that is where the
// new edges get a fade-out and a fade-in.

(function (root) {
  const dbToLin = (db) => 10 ** (db / 20);
  const linToDb = (x) => (x > 1e-6 ? 20 * Math.log10(x) : -120);

  /**
   * @param {(number|null)[]} peaks linear peak per point, null where no clip plays
   * @param {number} ms milliseconds per point
   * @param {{thr:number, minSil:number, pre:number, post:number}} o dB, ms, ms, ms
   * @returns {{sil:{a:number,b:number,before:boolean,after:boolean}[], on:Uint8Array}} point indices, b exclusive
   */
  function detect(peaks, ms, o) {
    const n = peaks.length, thr = dbToLin(o.thr);
    const pts = (x) => Math.max(0, Math.round(x / ms));
    const on = new Uint8Array(n);
    for (let i = 0; i < n; i++) on[i] = peaks[i] != null && peaks[i] > thr ? 1 : 0;
    // 2. Bridge short silences between two sounding stretches.
    const bridge = pts(o.minSil);
    for (let i = 0; i < n;) {
      if (on[i]) { i++; continue; }
      let j = i; while (j < n && !on[j]) j++;
      if (i > 0 && j < n && j - i < bridge) for (let k = i; k < j; k++) on[k] = 1;
      i = j;
    }
    // 3. Margins: grow every sounding stretch, never into points with no clip.
    const pre = pts(o.pre) + 1, post = pts(o.post);
    const grown = Uint8Array.from(on);
    for (let i = 0; i < n;) {
      if (!on[i]) { i++; continue; }
      let j = i; while (j < n && on[j]) j++;
      for (let k = Math.max(0, i - pre); k < i; k++) if (peaks[k] != null) grown[k] = 1;
      for (let k = j; k < Math.min(n, j + post); k++) if (peaks[k] != null) grown[k] = 1;
      i = j;
    }
    // 4. Silences: runs of points with a clip that do not sound.
    const sil = [];
    for (let i = 0; i < n;) {
      if (grown[i] || peaks[i] == null) { i++; continue; }
      let j = i; while (j < n && !grown[j] && peaks[j] != null) j++;
      const z = { a: i, b: j, before: i > 0 && !!grown[i - 1], after: j < n && !!grown[j] };
      // A silence at a clip's edge (sound on one side only) shorter than the minimum is left
      // alone: it is a sliver, not a silence worth a cut.
      if (!(z.before !== z.after && j - i < bridge)) sil.push(z);
      i = j;
    }
    return { sil, on: grown };
  }

  /** What Apply would do: silences removed, fade-ins and fade-outs on the new edges. */
  function count(sil) {
    let fin = 0, fout = 0;
    for (const z of sil) { if (z.before) fout++; if (z.after) fin++; }
    return { sil: sil.length, fin, fout };
  }

  root.StripSilence = { detect, count, dbToLin, linToDb };
})(typeof window !== 'undefined' ? window : globalThis);
