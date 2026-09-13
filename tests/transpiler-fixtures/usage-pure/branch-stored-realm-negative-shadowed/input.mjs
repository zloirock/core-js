// The shadowed self parameter belongs to the caller, including its Map property.
// Only a selected realm receives the polyfill; retain the original store.
export function read(self, flag) {
  let held;
  return (flag ? (held = globalThis) : self).Map;
}
