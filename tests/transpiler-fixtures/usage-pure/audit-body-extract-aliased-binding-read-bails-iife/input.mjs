// renamed-local binding (`from: alias`) read by a sibling in-pattern default (`dup = alias`).
// read-detection keys on the LOCAL binding name, not the property key, so `alias` is not
// relocated via body-extract and stays bound through inline-default. immediately-invoked twin:
// the lossy param emission is sound here because the single call site is visible.
(function make({ from: alias, dup = alias, ...rest } = Array) {
  return [alias([1]), dup, rest];
})();
