import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// where the assignment-host OVERWRITE may take its slot with it, and where the slot has to stay. the
// dispatch re-spells the receiver nav the raw pattern read, so a slot with no reader left simply
// drops - and an emptied host drops too. the boundaries below each keep the slot for a reason of
// their own, and the residual then reads the nav BESIDE the dispatch, which is what the receiver
// gate weighs
declare const userNs: {
  Array: {
    prototype: number[];
  };
};
let dropped, kept, sibling, wrapped, computed, other, z;
// the whole chain drops: the statement goes, the dispatch is the only read left
// ... and it drops off a USER namespace too, once the nav goes with it: the source reads
// `userNs.Array.prototype` once, and so does the render
dropped = _copyWithinMaybeArray(_globalThis.Array.prototype);
// a top-level SIBLING keeps the host, not the slot: what it reads is the assignment's own receiver
kept = _flatMaybeArray(userNs.Array.prototype);
({
  z
} = _globalThis);
// a REST keeps the emptied hop under a sentinel - the rest must go on excluding that key, so the
// residual still reads `globalThis.Array` beside the dispatch
sibling = _atMaybeArray(_globalThis.Array.prototype);
let rest;
var _unused;
({
  Array: _unused,
  ...rest
} = _globalThis);
// an ARRAY-wrapped element has no way to drop: pruning the leaf under it would leave `[{}]` behind
other = _fillMaybeArray(_globalThis.Array.prototype);
// a COMPUTED key is the one part of the pattern the dispatch never re-spells, so the slot is what
// runs it - the legs part on how far that surviving residual COLLAPSES its receiver, which is the
// SE-key channel's own question, not this one's
wrapped = _flatMapMaybeArray(_globalThis.Array.prototype);
({
  prototype: {
    [(effect(), 'includes')]: computed
  }
} = _globalThis.Array);
computed = _includesMaybeArray(_globalThis.Array.prototype);
export { dropped, kept, sibling, other, rest, wrapped, computed, z };