// conditional fallback where one branch is a user-namespace member (`someObj.Array`)
// and the other is the bare global `Array`. the user-namespace branch must NOT be
// treated as a proxy-global chain; only the resolving branch drives the polyfill
const someObj = { Array: class MyArray {} };
function f({ from } = cond ? someObj.Array : Array) {
  return from([1]);
}
function g({ of } = cond ? someObj.Array : Array) {
  return of(1, 2);
}
export { f, g };
