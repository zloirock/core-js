// A decided realm alias feeds the constructor pattern directly.
// Its original leaf default keeps the Array.of claim alive.
function read(enabled) {
  if (enabled) { var realm = globalThis; }
  const { Promise: { missing = Array.of(7) } } = realm;
  return missing;
}
export const value = read(true);
