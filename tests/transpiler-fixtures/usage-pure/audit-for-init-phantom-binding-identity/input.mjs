// a for-init declarator records a phantom self-violation; the filtered binding stand-in
// must keep a STABLE identity across lookups - per-binding caches and closure sets key by
// object identity, and a fresh copy per call silently dropped the recorded incompatible
// write, narrowing the union to a stale type-specific helper
for (let o = { data: [1, 2] as number[] | string }; globalThis.cond;) {
  o.data = 'str';
  o.data.at(0);
  break;
}
