import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `ReturnType<typeof NS.fn>` - qualified-name under ReturnType should resolve the referenced
// function's return annotation so `.at(0)` dispatches to the Array-specific helper
declare const NS: {
  fn: (x: unknown) => number[];
};
type Result = ReturnType<typeof NS.fn>;
declare const r: Result;
_atMaybeArray(r).call(r, -1);