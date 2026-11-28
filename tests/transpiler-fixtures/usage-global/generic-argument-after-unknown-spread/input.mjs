function box<T>(a: T, b: { v: T } = { v: a }, ...tail: unknown[]): { v: T } { return b; }
export function read(xs: any[]) {
  return box('ab', ...xs, { v: 'cd' }).v.at(0);
}
