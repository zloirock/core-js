import _Array$of from "@core-js/pure/actual/array/of";
// the proxy-global spelling of the same shadow: a parameter property may be named `globalThis`,
// and inside the constructor that name is the caller's object, so the navigation through it must
// stay exactly as written - collapsing it to the polyfill would read core-js's realm instead of
// the argument. The module-level read is the control: there the name IS the proxy global again
// and still collapses, which is what keeps the suppression from swallowing the real one.
class Realm {
  constructor(private globalThis: any) {
    return globalThis.Array.from([1]);
  }
}
new Realm({
  Array: {
    from: (x: number[]) => x
  }
});
const outside = _Array$of(2);
console.log(outside);