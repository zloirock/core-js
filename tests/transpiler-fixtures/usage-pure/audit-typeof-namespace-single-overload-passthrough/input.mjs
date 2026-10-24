// A namespaced function with a single signature (no overloads). ReturnType<typeof NS.fn>
// resolves to its only return type (number[]), so `.includes(0)` narrows to Array; the lone
// signature must not be discarded. (includes is distinct from sibling type-query fixtures so
// the emitted import marks which line fired.)
declare namespace NS {
  function fn(x: string): number[];
}
type R = ReturnType<typeof NS.fn>;
declare const r: R;
r.includes(0);
