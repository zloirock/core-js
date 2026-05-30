// User Thenable whose `then` callback first-arg is itself a `Promise<string[]>`. Per the
// TS Awaited contract `await x` resolves recursively: Awaited<Promise<string[]>> = string[],
// not Promise<string[]>. So `arr` is string[] and `.at(0)` must emit the array-narrow
// polyfill. A flat (non-recursive) resolution of the cb-arg would type `arr` as Promise and
// drop the array `.at`.
class Box {
  then(_cb: (v: Promise<string[]>) => any): Box {
    return this;
  }
}
declare const b: Box;
const arr = await b;
arr.at(0);
