// The assignment target's array annotation does not describe the source property read.
export function customSource(target: unknown[], key: () => void) {
  const source = { at: 17, after: 9 };
  ({ [(key(), 'at')]: target[0], after: target[1] } = source);
  return target;
}
