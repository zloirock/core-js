// where the assignment-host OVERWRITE may take its slot with it, and where the slot has to stay. the
// dispatch re-spells the receiver nav the raw pattern read, so a slot with no reader left simply
// drops - and an emptied host drops too. the boundaries below each keep the slot for a reason of
// their own, and the residual then reads the nav BESIDE the dispatch, which is what the receiver
// gate weighs
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";

declare const userNs: { Array: { prototype: number[] } };

let dropped,
	kept,
	sibling,
	wrapped,
	computed,
	other,
	z;

dropped = _copyWithinMaybeArray(_globalThis.Array.prototype);
kept = _flatMaybeArray(userNs.Array.prototype);

// the whole chain drops: the statement goes, the dispatch is the only read left
// ... and it drops off a USER namespace too, once the nav goes with it: the source reads
// `userNs.Array.prototype` once, and so does the render
// a top-level SIBLING keeps the host, not the slot: what it reads is the assignment's own receiver
({ z } = _globalThis);

sibling = _at(_globalThis.Array.prototype);

// a REST keeps the emptied hop under a sentinel - the rest must go on excluding that key, so the
// residual still reads `globalThis.Array` beside the dispatch
let rest;

var _unused;

({ Array: _unused, ...rest } = _globalThis);
other = _fillMaybeArray(_globalThis.Array.prototype);
wrapped = _flatMapMaybeArray(_globalThis.Array.prototype);

// an ARRAY-wrapped element has no way to drop: pruning the leaf under it would leave `[{}]` behind
// a COMPUTED key is the one part of the pattern the dispatch never re-spells, so the slot is what
// runs it - the legs part on how far that surviving residual COLLAPSES its receiver, which is the
// SE-key channel's own question, not this one's
({ [(effect(), 'includes')]: computed } = _globalThis.Array.prototype);

computed = _includes(_globalThis.Array.prototype);

export { dropped, kept, sibling, other, rest, wrapped, computed, z };