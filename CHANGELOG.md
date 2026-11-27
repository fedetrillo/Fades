# Changelog

## 1.2.1 — 2026-11-26

- **Fixed on Windows:** LUNA on Windows sizes the page to the window's outer size, title bar and frame included, so the bottom 39 px and the right 16 px were hidden. The page now leaves that space out on Windows, so everything at the bottom and right edges shows in full.
  the part you can see, so the controls at the bottom were hidden. The page now fits itself to
  the window size LUNA reports; nothing changes where the two match.
- **Report copy:** Alt-click on the version now always says in the status bar that the report was copied. Where the system clipboard is blocked (seen on some Windows set-ups) it uses a fallback, and if that fails too it shows the report selected so you can copy it by hand.

## 1.2.0 — 2026-11-25

- **New: Strip silence.** A second tab removes what does not sound on every selected track and
  fades every new cut in the same click: a fade-in where the sound comes back, a fade-out where
  it stops.
- **Four controls decide what is silence:** threshold, minimum silence, and margins before and
  after, so attacks and tails stay whole. The fade-in warns you when it is longer than the
  margin before.
- **See it before you apply it:** the selected track's waveform with the threshold, what will be
  removed, the margins and the new fades; the bar and the button say how many silences go and
  how many fades are made ("Remove 46 silences and make 92 fades").
- **Presets** for toms, kick and snare, vocals and dialog.
- **Undo** takes the whole run back in one click.

## 1.1.0 — 2026-11-25

- **See it before you apply it:** the bar at the top shows your selection (tracks, clips and
  range) and how many fade-ins, crossfades and fade-outs Apply will make; the button says it too
  ("Apply 33 fades").
- **One clear choice for fades already there:** keep them and only create new ones, create new
  ones and adjust the ones there, or only adjust them. "Choose per type…" brings back the 1.0
  per-card options.
- **Each kind of fade has its colour** on the strip and its card: green fade-in, turquoise
  crossfade, blue fade-out.
- **Crossfade icons show a crossfade:** both curves for each shape, and where it sits against the
  cut for the placement.
- **Seven colours** for the window, like the other Add Ons.

## 1.0.1 — 2026-11-25

- A short getting-started guide: the first time it opens it asks for your language, then walks
  you through the window in it. The **Guide** button brings it back.

## 1.0.0 — 2026-11-23

- First release: batch fade-ins, fade-outs and crossfades on every audio clip of the selected
  tracks, in the range or across whole tracks.
- Draggable lengths on a strip that draws every fade to scale; three shapes; crossfade
  placement before, centred on or after the cut.
- Create new fades and/or adjust the shape and length of existing ones.
- Built-in and your own presets, Compare, Remove fades, one-step Undo.
- Dark and grey themes, 7 languages, Alt-click the version for a support report.
