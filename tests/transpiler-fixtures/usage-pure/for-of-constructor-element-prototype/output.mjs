import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A constructor element retains its prototype family in patterns and member reads.
// Repeated identical constructors agree; shadowed and mixed elements stay conservative.
for (const R of [Array, Array]) {
  const at = _atMaybeArray(R.prototype);
  _includesMaybeArray(R.prototype);
}