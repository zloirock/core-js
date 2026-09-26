import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4;
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
// An array-wrapped element captures the source before the dispatched read.
[_ref] = [_globalThis];
// a COMPUTED key is the one part of the pattern the dispatch never re-spells, so the slot is what
// runs it - the legs part on how far that surviving residual COLLAPSES its receiver, which is the
// SE-key channel's own question, not this one's
wrapped = _flatMapMaybeArray(_ref.Array.prototype);
_ref2 = {
  prototype: _ref3
} = _globalThis.Array, _ref4 = _ref3, null == _ref4 ? _ref4[""] : (effect(), computed = _includesMaybeArray(_ref4)), _ref4, _ref2;
export { dropped, kept, sibling, other, rest, wrapped, computed, z };