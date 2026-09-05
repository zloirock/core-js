import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// a LOOP HEAD hosts no statement, so the discarded init stays in the header as the `_unused` sink
// BEHIND the extractions, every reader spells the surface itself and the emptied residual leaves.
// the extractions keep SOURCE order whichever channel renders them - the statics through the
// flatten at the first prop's dispatch, the instance claims through the per-prop route later
let out1;
let out2;
for (const headValues = _valuesMaybeArray(_globalThis.Array.prototype), headAt = _atMaybeArray(_globalThis.Array.prototype), headKeys = _Object$keys, _unused = (_globalThis.effect ??= 1, _globalThis); !out1;) out1 = [headValues, headAt, headKeys];
for (const tailKeys = _Object$keys, tailAt = _atMaybeArray(_globalThis.Array.prototype), _unused2 = (_globalThis.effect ??= 2, _globalThis); !out2;) out2 = [tailKeys, tailAt];
export const r = [typeof out1[0], typeof out1[1], typeof out1[2], typeof out2[0], typeof out2[1]];