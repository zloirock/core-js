// The initialized realm supplies its static directly.
function read() {
  try { var realm = globalThis; } finally {}
  return realm.Promise.allSettled([]);
}
