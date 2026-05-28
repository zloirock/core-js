import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// type alias dereferencing a user-Thenable class. `await x` runs the structural
// peel via the fall-through path: `findClassPathForTypeReference` returns null
// (alias is not a value binding), `getTypeMembers` walks the alias to the class
// body, returning a ClassMethod for `then`. cb extraction unified for class +
// interface member shapes so U substitutes to `string` and `.at(0)` narrows to
// the string-instance polyfill
type Aliased<U> = MyThenable<U>;
class MyThenable<U> {
  then(cb: (v: U) => void): MyThenable<U> {
    return this;
  }
}
declare const x: Aliased<string>;
export async function foo() {
  const v = await x;
  return _atMaybeString(v).call(v, 0);
}