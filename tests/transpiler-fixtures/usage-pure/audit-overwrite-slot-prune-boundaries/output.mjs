import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// an instance claim through a nested nav in an assignment pattern, extracted as an assignment: when it
// consumes every slot the statement goes and the dispatch is the only read left, off the realm or off a
// user namespace. a top-level sibling keeps the host, not the slot; a rest keeps the pattern native, its
// claim included; an array wrapper captures its element first; a computed key keeps the slot running it.
declare const userNs: {
  Array: {
    prototype: number[];
  };
};
let dropped, kept, sibling, wrapped, computed, other, z;
dropped = _copyWithinMaybeArray(_globalThis.Array.prototype);
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
[,] = [_globalThis];
wrapped = _flatMapMaybeArray(_globalThis.Array.prototype);
({
  prototype: _ref
} = _globalThis.Array), null == _ref ? _ref[""] : (effect(), computed = _includesMaybeArray(_ref));
export { dropped, kept, sibling, other, rest, wrapped, computed, z };