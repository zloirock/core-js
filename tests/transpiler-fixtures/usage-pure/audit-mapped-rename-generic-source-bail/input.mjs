// Mapped over a function-local type-param `T` has no concrete members to enumerate.
// Expansion must bail gracefully so the call falls back to the generic instance polyfill.
type Rename<T> = { [K in keyof T as `_${string & K}`]: T[K] };
function probe<T>(r: Rename<T>) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  r._a.at(0);
}
probe({ a: [1] });
