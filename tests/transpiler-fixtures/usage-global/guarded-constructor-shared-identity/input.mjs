// A guarded constructor result read through a member owes its full namespace for the file.
// Direct reads and guarded reads of that constructor must use the same imported identity.
function read(enabled) {
  if (enabled) { var realm = globalThis; }
  const same = realm.Promise === Promise;
  return [same, typeof realm.Promise.allSettled];
}
