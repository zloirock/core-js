// An undecided selection keeps the prefixed Array receiver branch-local. The pure-read prefix may be
// discarded only with its selected receiver; either arm still supplies the Array.from polyfill.
export function read(flag) {
  const { from } = flag ? Array : ((globalThis.marker, globalThis.self).Array);
  return from;
}
