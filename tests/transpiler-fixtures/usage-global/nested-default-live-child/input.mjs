// The default is a live receiver arm, with its own child claim.
// The present slot stays independent and its getter runs once.
export function read(source) {
  const { k: { at: method } = Array.from([4, 9]) } = source;
  return method;
}
