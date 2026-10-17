// A mirror serves `from` without consuming its assignment target.
// A later retained prototype capture still writes `from` in its source slot.
export function read(pick) {
  let from, at;
  ({ from, prototype: { at } } = pick() ? Array : Array);
  return [from([3])[0], at.call([4], 0)];
}

export const truthy = read(() => true);
export const falsy = read(() => false);
