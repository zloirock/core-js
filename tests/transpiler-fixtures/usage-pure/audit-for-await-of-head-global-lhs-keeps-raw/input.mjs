// for-await-of head bound to a bare global is the same per-iteration write target as for-of /
// for-in (a `for await (...)` is still a ForOfStatement); pure mode must keep it raw, since a
// frozen import binding write would TypeError. a read elsewhere (WeakSet) is still polyfilled -
// the guard is scoped to the loop head LHS
async function drain(stream) {
  for await (Map of stream) {}
  return new WeakSet();
}
