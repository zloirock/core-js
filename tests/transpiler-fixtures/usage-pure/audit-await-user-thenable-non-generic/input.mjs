// non-generic Thenable: class with no type-params, callback's first-arg annotation is a
// concrete type directly. `arr` resolves to `number[]` without any substitution step.
// narrow Array dispatch fires
class Box {
  then(cb: (v: number[]) => any, _e?: any): Box {
    return this;
  }
}
declare const b: Box;
async function go() {
  const arr = await b;
  arr.at(0);
  arr.includes(1);
}
go();
