import _Array$from from "@core-js/pure/actual/array/from";
// NEGATIVE: bodyless host but the static-value receiver has NO side effects
// (`{from} = Array` instead of `(se(), Array)`). without SE, the block-wrap branch
// doesn't fire and the bodyless `if` stays bodyless after a simple replacement.
// regression guard that the wrap only fires when SE is present.
let from;
if (cond) from = _Array$from;