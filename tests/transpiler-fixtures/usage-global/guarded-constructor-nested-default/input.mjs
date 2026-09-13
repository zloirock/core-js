// A conditional realm feeds a nested constructor pattern with a live default.
// The constructor and the default's Array.of each need their own polyfill.
function read(enabled) {
  if (enabled) { var realm = globalThis; }
  const { Promise: { missing = Array.of(7) } } = realm;
  return missing;
}
export const value = read(true);
