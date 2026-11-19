// a guard branch that returns only after a conditional `break` to a label - around the guard, or
// around a case body - does not exit on every path: the guarded type reaches the read after it, so
// the receiver is not narrowed to the other arm. distinct method per line
export function a(x: string | number[], c: boolean) {
  outer: if (typeof x === 'string') {
    if (c) break outer;
    return 0;
  }
  return x.at(0);
}
export function b(x: string | number[], c: boolean) {
  switch (typeof x) {
    case 'string': l: {
      if (c) break l;
      return 0;
    }
    // @ts-expect-error a call on a union receiver tsc cannot type is the shape under test
    case 'object': return x.includes(1);
  }
}
