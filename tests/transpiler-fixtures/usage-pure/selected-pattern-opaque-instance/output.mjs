// An unreadable selected arm leaves the receiver set open.
// Global injection must retain instance entries; pure keeps the unknown presence test native.
function read(flag, factory) {
  let O = null;
  [O] = flag ? [Object] : factory();
  return 'entries' in O;
}
export const result = [read(true, () => [[]]), read(false, () => [[]])];