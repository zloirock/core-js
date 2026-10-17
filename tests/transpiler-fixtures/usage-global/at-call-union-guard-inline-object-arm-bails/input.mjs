// an inline object type answers to no nominal family, so the resolver cannot rule it out: the
// `typeof` throw removes nothing from the union, it stays whole and both families inject
export function inlineObject(x: number[] | { at(i: number): string }) {
  if (typeof x === 'function') throw new TypeError('bad input');
  return x.at(1);
}
