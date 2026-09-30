// A quoted sibling and rest leave reachable claims in the receiver default visible.
// User leaf defaults and the supplied receiver retain their independent meanings.
// Global presence guard; the companion pure fixture locks the receiver rewrites.
let of, dash, fromEntries, rest;
[{ Array: { of }, 'with-dash': dash } = globalThis] = [];
[{ Object: { fromEntries }, ...rest } = globalThis] = [];
export function read(source) {
  const [{ Map: { groupBy = 1 }, '[key]': raw = 2 } = globalThis] = source;
  return [groupBy, raw];
}
