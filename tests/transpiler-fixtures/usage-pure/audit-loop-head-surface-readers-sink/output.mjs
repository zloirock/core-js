import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A loop head keeps the effectful initializer in a capture before its extracted readers.
// Statics and instance methods then retain source property order. An emptied residual
// may disappear once that leading capture owns the initializer evaluation.
let out1;
let out2;
for (const _ref = (_globalThis.effect ??= 1, _globalThis), headValues = _valuesMaybeArray(_globalThis.Array.prototype), headAt = _atMaybeArray(_globalThis.Array.prototype), headKeys = _Object$keys; !out1;) out1 = [headValues, headAt, headKeys];
for (const _unused = (_globalThis.effect ??= 2, _globalThis), tailKeys = _Object$keys, tailAt = _atMaybeArray(_globalThis.Array.prototype); !out2;) out2 = [tailKeys, tailAt];
export const r = [typeof out1[0], typeof out1[1], typeof out1[2], typeof out2[0], typeof out2[1]];