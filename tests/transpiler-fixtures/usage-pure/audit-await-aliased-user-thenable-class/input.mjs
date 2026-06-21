// type alias dereferencing a user-Thenable class. `await x` runs the structural peel via the
// fall-through path: the alias is not a value binding, so resolution walks it to the class
// body and reads the `then` ClassMethod. callback extraction is unified across class and
// interface member shapes, so U substitutes to `string` and `.at(0)` narrows to string
type Aliased<U> = MyThenable<U>;
class MyThenable<U> {
  then(cb: (v: U) => void): MyThenable<U> {
    return this;
  }
}
declare const x: Aliased<string>;
export async function foo() {
  const v = await x;
  return v.at(0);
}
