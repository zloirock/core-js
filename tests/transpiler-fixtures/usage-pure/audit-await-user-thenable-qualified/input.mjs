// `await t` where t's annotation is qualified-name TSTypeReference `NS.MyThenable<T>`.
// peelUserThenable previously rejected qualified-name (Identifier-only guard), so the
// narrow on `arr` dropped and `arr.at(0)` emitted generic _at. downstream
// findClassPathForTypeReference + getTypeMembers handle qualified names already, so
// dropping the guard lets the structural Thenable peel proceed; narrow lands on the
// then-callback's first param (string[]) and `.at(0)` emits _atMaybeArray
namespace NS {
  export class MyThenable<T> {
    then(_cb: (v: T) => any, _e?: any): MyThenable<T> { return this; }
  }
}
declare const t: NS.MyThenable<string[]>;
async function go() {
  const arr = await t;
  arr.at(0);
}
go();
