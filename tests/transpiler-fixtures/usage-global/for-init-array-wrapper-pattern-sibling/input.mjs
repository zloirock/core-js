// The initializer evaluates whole before any method is read. Pattern elements then read in
// source order: the first element's methods precede the next element's property getter.
export function sibling(receiver, effect) {
  for (let [{ w: { values }, y: { at } }, { z }] = [receiver, effect()]; ;) return [values, at, z];
}
