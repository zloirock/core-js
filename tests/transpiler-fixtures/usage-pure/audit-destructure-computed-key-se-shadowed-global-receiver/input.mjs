// the receiver references a SHADOWED name (a param), not the global - the copied-receiver substitution
// must NOT rewrite it to the pure binding (it is the local Promise, not the global)
function f(Promise) {
  const { [(eff(), 'flat')]: m } = [1, Promise];
  return m;
}
