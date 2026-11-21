export function selected(pick) {
  const { Array: { prototype: { map } } } = pick && globalThis;
  return map;
}
