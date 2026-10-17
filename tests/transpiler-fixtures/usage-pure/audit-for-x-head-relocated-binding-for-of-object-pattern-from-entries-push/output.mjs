import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
const seen = [];
// the minted head binding is what the relocated pattern reads, and no scope saw it born: a STATIC
// claim needs its receiver NAMED, so the leg registers the binding it just minted and the guard
// picks the polyfill on the iteration where the element is the constructor the source spelled.
// a MIXED literal is where that guard earns its keep - the mirror cannot spell one element per pass
// there, so the relocation is what serves the claim
for (const {
  fromEntries
} of [{
  fromEntries: _Object$fromEntries
}, {
  fromEntries: 0
}]) {
  _pushMaybeArray(seen).call(seen, typeof fromEntries);
}
export { seen };