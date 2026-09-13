// A conditional realm feeds a nested constructor pattern with a live default.
// Guarding the constructor read must keep the default's Array.of claim alive.
function read(enabled) {
  if (enabled) { var realm = globalThis; }
  const { Promise: { missing = Array.of(7) } } = realm;
  return missing;
}
export const value = read(true);
