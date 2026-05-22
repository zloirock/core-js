// namespaced function with a single signature (no overloads). pickLastAmbientOverload
// must passthrough when the namespaced lookup returns exactly one match - guards
// against an off-by-one that would discard the only available overload. includes is
// distinct from sibling type-query fixtures so the polyfill import marks origin.
declare namespace NS {
  function fn(x: string): number[];
}
type R = ReturnType<typeof NS.fn>;
declare const r: R;
r.includes(0);
