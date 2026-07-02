// `'from' in void 0` - RHS evaluates to undefined, runtime TypeError. plugin doesn't
// fold this to true (RHS isn't a known polyfillable receiver), no inject. covers the
// RHS-as-void-expression case where static analysis bails to no-op
'from' in void 0;