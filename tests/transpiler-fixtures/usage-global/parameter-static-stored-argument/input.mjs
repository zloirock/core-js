// A stored argument still names its selected static for global injection.
// Pure keeps the captured value and declines the argument mirror; the opaque default stays intact.
export function outer(Custom, effect) {
  let held;
  function read({ of } = Custom) { return of(1); }
  const result = read.call(null, held = (effect(), globalThis.Array));
  return [result, held === globalThis.Array];
}
