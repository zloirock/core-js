import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3;
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
sibling = _atMaybeArray(_globalThis.Array.prototype);
let rest;
({
  Array: {
    prototype: {
      fill: other
    }
  },
  ...rest
} = _globalThis);
// an ARRAY-wrapped element has no way to drop: pruning the leaf under it would leave `[{}]` behind
// a COMPUTED key is the one part of the pattern the dispatch never re-spells, so the slot is what
// runs it - the legs part on how far that surviving residual COLLAPSES its receiver, which is the
// SE-key channel's own question, not this one's
wrapped = _flatMapMaybeArray(_globalThis.Array.prototype);
_ref = {
  prototype: _ref2
} = _globalThis.Array, _ref3 = _ref2, null == _ref3 ? _ref3[""] : (effect(), computed = _includesMaybeArray(_ref3)), _ref3, _ref;
export { dropped, kept, sibling, other, rest, wrapped, computed, z };