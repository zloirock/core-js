// The initialized realm supplies its static directly.
function read() {
  try { var realm = globalThis; } finally {}
  const held = realm;
  return held.Promise.allSettled([]);
}
