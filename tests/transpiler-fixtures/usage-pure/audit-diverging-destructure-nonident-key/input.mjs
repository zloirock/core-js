// a non-identifier quoted key in a nested-mixed global-DIVERGING destructure: both emitters
// render the synth-literal key via an identifier, which throws (babel) or emits non-reparsing
// text (unplugin) for `'with-dash'`. the whole mirror bails to the sound per-branch native
// fallback (receiver swap only) - the polyfillable `Array.from` sibling still resolves off the
// swapped proxy binding, the quoted key stays a raw string-keyed read
const { Array: { from }, "with-dash": w } = c ? globalThis : userObj;
export const r = from([1]);
export const r2 = w;

// a non-identifier COMPUTED key folding to a non-identifier string bails the same way
const dash = "a-b";
const { Map: { groupBy }, [dash]: v } = c2 ? globalThis : otherObj;
export const r3 = groupBy;
export const r4 = v;

// a NUMERIC key in the diverging destructure bails the mirror the same way (`0` is not a
// valid identifier name); the polyfillable sibling still resolves off the swapped proxy
const { Set: { union }, 0: zero } = c3 ? globalThis : thirdObj;
export const r5 = union;
export const r6 = zero;
