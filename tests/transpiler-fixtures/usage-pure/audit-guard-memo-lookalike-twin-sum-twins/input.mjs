// TWO twins past the root: each takes its own slot, and the ordinals must not drift
export function sumTwins(fn, o) {
  return o.items?.includes(o.items.findLastIndex(fn) + o.items.findIndex(fn));
}
