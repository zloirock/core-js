// `const enum Map { A }` is inlined by `tsc` - `Map.A` references replaced with literal
// values pre-runtime. plugin rewriting `Map.A` to `_Map.A` would break tsc inlining (no
// `_Map` const enum exists post-rewrite). treat as binding shadow same as regular enum
const enum Map {
  A,
  B,
}
const m = Map.A;
export { m };
