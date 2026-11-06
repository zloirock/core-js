// A receiver mirror carries resolved string keys as literal names, including bracket-shaped keys.
// Native passthroughs use ordinary data slots. A declined rest keeps native leaves.
let ctor, dash, bracket, empty, prototype, of, rest;
[{ Set: ctor, 'with-dash': dash, '[key]': bracket, '': empty, __proto__: prototype, Array: { of } } = globalThis] = [];
[{ Set: ctor, Array: { of }, ...rest } = globalThis] = [];
export function read(source) {
  const [{ Array: { from = 1 }, 'with-dash': raw = 2 } = globalThis] = source;
  return [from, raw];
}
export const result = [ctor, dash, bracket, empty, prototype, of, rest];

// Repeated keys keep separate native reads beside quoted and identifier siblings.
export function readRepeated(source) {
  const [{ Array: { of }, 'with-dash': dash, late: first, late: second } = globalThis] = source;
  return [of, dash, first, second];
}
