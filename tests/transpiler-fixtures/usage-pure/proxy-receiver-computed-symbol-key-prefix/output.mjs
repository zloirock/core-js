import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
// Collapsing a sealed proxy receiver preserves its prefix and computed hop effects.
// The receiver value is selected before the later computed symbol-key effect.
export const result = (prefix(), hop(), key(), _getIterator(_globalThis));