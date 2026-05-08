// Mapped over a function-local type-param `T` has no concrete members to enumerate.
// Expansion must bail gracefully so the call falls back to the generic instance polyfill.
type Rename<T> = { [K in keyof T as `_${string & K}`]: T[K] };
function probe<T>(r: Rename<T>) {
  r._a.at(0);
}
probe({ a: [1] });
