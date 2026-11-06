// A stored array is reachable while a preceding element's method getter runs.
// Keep iteration native so that getter can change the following position.
export let stored;
export function keyed(input) {
  const { w: [{ at }, tail] } = { w: (stored = [input, 0]) };
  return [at, tail, stored];
}
export function nested(input) {
  const [{ w: [{ includes }, tail] }] = [{ w: (stored = [input, 0]) }];
  return [includes, tail, stored];
}
