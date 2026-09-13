// A nested constructor slot from a conditional realm alias keeps the outer identity guard.
// Its child pattern reads static properties from that constructor's complete pure namespace.
function read(enabled) {
  if (enabled) { var realm = globalThis; }
  const { Promise: { allSettled } } = realm;
  return typeof allSettled;
}
