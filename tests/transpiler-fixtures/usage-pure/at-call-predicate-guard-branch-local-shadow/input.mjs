// a guard test evaluates in the scope of the statement that hosts it, not in the block its branch
// opens: a predicate declared INSIDE the braced branch is not what the test called, so the outer
// non-predicate `check` narrows nothing and the generic helper dispatches; the unbraced branch
// spelling never opened a block and is the control (no shadow, nothing narrows either way). the
// third function shadows the `Array` the test's `Array.isArray` reads only inside the branch, so
// the built-in guard still narrows the outer read
declare function check(v: unknown): boolean;
export function braced(v: unknown) {
  if (check(v)) {
    const check = (x: unknown): x is string => typeof x === 'string';
    return v.at(0);
  }
  return null;
}
export function unbraced(v: unknown) {
  if (check(v)) return v.at(0);
  return null;
}
export function builtIn(v: unknown) {
  if (Array.isArray(v)) {
    const Array = 0;
    return v.includes('a');
  }
  return null;
}
