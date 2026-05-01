import _at from "@core-js/pure/actual/instance/at";
// generic source `T` inside a function body: T is an unbound type-param, so
// `getTypeMembers(T)` returns null and `expandMappedTypeMembers` bails. the receiver
// type stays unresolved and `.at(0)` falls back to the generic polyfill (graceful bail)
type Rename<T> = { [K in keyof T as `_${string & K}`]: T[K] };
function probe<T>(r: Rename<T>) {
  var _ref;
  _at(_ref = r._a).call(_ref, 0);
}
probe({
  a: [1]
});