// A namespace has no prototype; its nested pattern still rejects the absent value.
export function declaration() {
  const { Math: { trunc, prototype: { [Symbol.iterator]: iterator } } } = globalThis;
  return [trunc, iterator];
}
export function parameter({ JSON: { stringify, prototype: { [Symbol.iterator]: iterator } } } = globalThis) {
  return [stringify, iterator];
}
