// A nested assignment reads its uncertain slot before assigning the extracted static.
// The later computed property may win, so the runtime receiver selects the static.
function read(key) {
  const ns = { Q: Array, [key]: Map };
  let method;
  ({ Q: { of: method } } = ns);
  return method;
}
export const kinds = [typeof read('other'), typeof read('Q')];
