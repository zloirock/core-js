import "core-js/modules/es.array.at";
// Same method-shape pathway through a static member - exercises the qualified type-query
// branch where the root is a class binding itself (not an instance). `at` is shared by
// Array and String prototypes; correct narrowing emits the array entry only, a regression
// would also pull in `es.string.at` - the polyfill set is the distinguishing signal.
declare class X {
  static parse(input: string): number[];
}
type R = ReturnType<typeof X.parse>;
declare const r: R;
r.at(-1);