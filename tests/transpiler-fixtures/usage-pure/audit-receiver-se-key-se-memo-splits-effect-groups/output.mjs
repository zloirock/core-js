import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// a harvested effect list carries the receiver's own effects first and the computed-key ones
// after, and the receiver memo belongs BETWEEN them: ECMA evaluates the receiver before the
// key, so a memo leading the whole list would read the receiver ahead of the prefix that
// evaluates it. the negatives pin the boundary - a key-only list has nothing to lead, and a
// literal receiver fuses its memo into the lookup, where constructing it observes nothing
const split = (recv(), _ref = box.list, k(), _at(_ref).call(_ref, 0));
const keyOnly = (_ref2 = box.list, k(), _flatMaybeArray(_ref2).call(_ref2));
const fused = (recv(), k(), _includesMaybeArray(_ref3 = [1, 2]).call(_ref3, 1));
split;
keyOnly;
fused;