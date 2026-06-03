// for-init nested flatten with a residual sibling whose default holds an instance call. the
// for-loop header forbids preceding statements, so extraction + residual destructure fold into
// one comma-joined declaration; the residual `seed` default `[5].at(0)` must still be polyfilled
// in place. its memo `_ref` binding is declared BEFORE the loop, not inside the body after its
// use in the header (distinct instance `at` vs the flattened static `from`)
for (var { Array: { from }, seed = [5].at(0) } = globalThis; seed; seed--) {
  from([seed]);
}
