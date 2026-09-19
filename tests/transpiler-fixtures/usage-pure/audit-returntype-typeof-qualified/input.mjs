// `ReturnType<typeof NS.fn>` - qualified-name under ReturnType should resolve the referenced
// function's return annotation so `.at(0)` dispatches to the Array-specific helper
declare const NS: {
  fn: (x: unknown) => number[];
};
type Result = ReturnType<typeof NS.fn>;
declare const r: Result;
r.at(-1);
