// usage-pure optional CALL on a polyfillable static via a computed string key, different static
// (`Array["of"]?.(x).flat()`): the dead `?.` on the always-defined static must be owned by the
// static visitor, not claimed and deopted by the instance transform. regression lock
function f(x) {
  return Array["of"]?.(x).flat();
}
f;
