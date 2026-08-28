// a symbol-key leaf under NESTED plain-key hops extracts through the member chain:
// the sole-binding declarator collapses to `getIteratorMethod(root.hop...)`
const { inner: { [Symbol.iterator]: it } } = obj;
const { a: { b: { [Symbol.iterator]: deep } } } = obj;
export { it, deep };

// a PRISTINE proxy-global root reads through its pure import when it has one (`self`),
// bare when it does not (`window`); a pristine proxy HOP is pure navigation and drops
const { inner: { [Symbol.iterator]: viaSelf } } = self;
const { inner: { [Symbol.iterator]: viaWindow } } = window;
const { self: { [Symbol.iterator]: viaHop } } = globalThis;
export { viaSelf, viaWindow, viaHop };

// a BOUND root is the user's own binding whatever its name - raw reads only
function take(self) {
  const { inner: { [Symbol.iterator]: shadowed } } = self;
  return shadowed;
}
// a missing-able CTOR root reads through its pure constructor
const { whatever: { [Symbol.iterator]: viaMap } } = Map;
export { take, viaMap };

// a sibling binding keeps the PATTERN alive, but not the hop: the leaf leaves and the emptied
// hop prunes with it, so the sibling reads its own key and nothing reads `inner` twice
const { inner: { [Symbol.iterator]: kept }, keep } = obj;
// NEGATIVE: a computed hop key cannot be walked - the chain is unresolvable
const { [k]: { [Symbol.iterator]: viaComputed } } = obj;
export { kept, keep, viaComputed };

// NEGATIVE: a param host has no init to root the chain in
function param({ inner: { [Symbol.iterator]: fromParam } }) {
  return fromParam;
}
export { param };
