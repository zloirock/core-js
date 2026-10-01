// A stored argument identifies its selected static for global injection.
// Pure retains the captured receiver, opaque parameter default and native leaf read.
export function outer(Custom, effect) {
  let held;
  function read({ of } = Custom) { return of(1); }
  const result = read.call(null, held = (effect(), globalThis.Array));
  return [result, held === globalThis.Array];
}
