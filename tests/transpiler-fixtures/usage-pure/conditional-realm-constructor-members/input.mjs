// A constructor read through a conditionally initialized realm alias keeps an identity guard.
// Members read from that result require the constructor's complete pure namespace.
function read(present) {
  if (present) {
    var realm = globalThis;
  }
  return realm.Promise.allSettled([]);
}
