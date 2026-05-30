// Generic User Thenable whose `then` callback first-arg is a PLAIN non-thenable `T[]`
// (no Promise wrapper). With T = string the cb-arg substitutes to `string[]`, so `await x`
// yields `string[]` directly. Guards against the recursive Awaited peel over-stripping a
// non-thenable: the array narrow for `.includes` must still resolve, not collapse to a wider type.
class Box<T> {
  then(_cb: (v: T[]) => any): Box<T> {
    return this;
  }
}
declare const b: Box<string>;
const arr = await b;
arr.includes("a");
