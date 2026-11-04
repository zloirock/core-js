// Even an empty default belongs to its hop. The neighbouring initializer runs first.
export function read(value, effect) {
  let at;
  ({ slot: { at } = [] } = { slot: value, other: effect() });
  return at;
}
