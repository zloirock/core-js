// A user object the receiver walk resolves through its own keys is a mirror root exactly as a pristine proxy global is, under keys
// naming no constructor too: the effect-keyed pattern renders ONCE, off the ponyfills.
let hits = 0;
export function fromParameter(root) {
  let paramBind, paramFrom;
  ({ Object: { keys: { [(hits++, 'bind')]: paramBind } }, Array: { [(hits++, 'from')]: paramFrom } } = root);
  return [typeof paramBind, typeof paramFrom];
}
