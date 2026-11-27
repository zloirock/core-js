// The optional field can select a string fallback, even through a shared composite type.
// Both receiver families must remain available after the type annotations are erased.
type A = { list: string[] };
type X<T> = A & A;
export function read<T>(x: Partial<X<T>>) {
  return (x.list ?? 'cat').includes('at');
}
export function first<T>(x: Partial<X<T>>) {
  return (x.list ?? ['cat']).at(0);
}
