import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// `interface A<T> extends B<T[]>; interface B<T> { b: T }` - the inner B<T[]> binds B's
// type-param T to A's `T[]` slot. recursive `getTypeMembers(B<T[]>)` already substitutes
// B's body using its own subst, returning `[{b: T[]}]` in A's coordinate space. previous
// code RE-applied B's subst on top of the recursive result, and since A and B share the
// type-param NAME 'T', the inner T inside `T[]` was substituted AGAIN, yielding `T[][]`.
// the final receiver subst then mapped `T[][]` to `string[][]` instead of `string[]`.
// observable downstream: `a.b[0]` resolves to `string` after the fix (was `string[]`),
// so `.at()` ships the string-specific polyfill rather than the array-specific one
interface A<T> extends B<T[]> {}
interface B<T> {
  b: T;
}
declare const a: A<string>;
_atMaybeString(_ref = a.b[0]).call(_ref, 0);