// An opaque caller does not identify a built-in owner by its method names.
// The independent native caller still requires Array.from.
function native(held) { return held.from([1]); }
native(Array);
function read(held) {
  return [held.of([2]), held.resolve(3), held.allSettled([]), held.groupBy([4])];
}
read(custom);
