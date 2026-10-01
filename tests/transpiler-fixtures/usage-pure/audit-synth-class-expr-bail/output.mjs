// receiver-rewrite bails when the default receiver is a class expression:
// `function({from} = class extends Array {})` - the receiver isn't a bare identifier,
// so the rewrite can't statically pick a polyfill. The per-key destructure-default
// fallback would also need to know the static methods of the anonymous class, which
// it doesn't. The plugin emits the original code unchanged
function f({
  from
} = class extends Array {}) {
  return from;
}
f();