// usage-pure optional CALL on a polyfillable static via a computed string-literal key
// (`Array["from"]?.(...)`) followed by a polyfillable instance method (`.flat`): the static callee
// is always defined post-rewrite so the `?.` is dead. recognising the computed key like the dotted
// form lets the static visitor own the `?.`; otherwise unplugin's compose crashes. regression lock
function f(x) {
  return Array["from"]?.(x).flat();
}
f;
