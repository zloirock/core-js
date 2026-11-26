import _at from "@core-js/pure/actual/instance/at";
// Await calls then with a function even when the declared parameter is a string.
// This implementation never settles. Its signature supplies no fulfilled receiver type.
class NotAThenable {
  then(_cb: string): NotAThenable {
    return this;
  }
}
declare const n: NotAThenable;
async function go() {
  // @ts-expect-error an await over a value tsc refuses is the shape under test
  const arr = await n;
  _at(arr).call(arr, 0);
}
go();