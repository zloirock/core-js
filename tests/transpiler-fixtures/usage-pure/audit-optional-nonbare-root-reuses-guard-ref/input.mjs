// non-bare optional root `a.b?.c` feeds two non-optional polyfilled hops; the inner hop must
// read the memoized root (`_ref.c`) instead of re-evaluating `a.b` and reading through a
// now-nullish prefix
a.b?.c.slice(1).flat(2);
