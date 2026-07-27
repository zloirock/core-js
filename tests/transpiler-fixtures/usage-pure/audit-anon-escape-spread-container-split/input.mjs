// a spread is not one channel. spreading a method-bearing object into an OBJECT literal copies its
// own properties - fields and method shorthands alike - so the values are reachable from outside and
// the narrow must stand down; spreading into a CALL hands the iterated values to a callee this scan
// cannot see, same verdict. an ARRAY spread only iterates and copies no property, so it keeps
// everything local - unless the object can iterate ITSELF, because a computed key may be
// `Symbol.iterator` and such an iterator can yield `this`. distinct method per row, and both carry
// an array and a string variant so the widened entry is visible as a different helper
export function intoArray() {
  const held = { items: [1], read() { return this.items.at(0); } };
  const copy = [...held];
  return [held.read(), copy];
}
export function intoObject() {
  const held = { items: [1], read() { return this.items.includes(1); } };
  const copy = { ...held };
  return [held.read(), copy];
}
export function intoCall() {
  const held = { items: [1], read() { return this.items.at(0); } };
  sink(...held);
  return held.read();
}
export function intoArrayButIterable() {
  const held = { items: [1], *[Symbol.iterator]() { yield this; }, read() { return this.items.includes(1); } };
  const copy = [...held];
  return [held.read(), copy];
}
