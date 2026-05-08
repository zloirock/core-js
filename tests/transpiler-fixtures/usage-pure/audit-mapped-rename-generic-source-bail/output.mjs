import _at from "@core-js/pure/actual/instance/at";
// Mapped over a function-local type-param `T` has no concrete members to enumerate.
// Expansion must bail gracefully so the call falls back to the generic instance polyfill.
type Rename<T> = { [K in keyof T as `_${string & K}`]: T[K] };
function probe<T>(r: Rename<T>) {
  var _ref;
  _at(_ref = r._a).call(_ref, 0);
}
probe({
  a: [1]
});