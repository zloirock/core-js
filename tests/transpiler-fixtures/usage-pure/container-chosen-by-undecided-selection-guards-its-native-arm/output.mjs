import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Reflect from "@core-js/pure/actual/reflect";
// an undecided selection of containers leaves the static read off its slot to whichever arm ran: an arm
// that is a native static owner guards its static against the captured slot, and an arm pure swaps whole
// reads its own - through an alias, in a slot, and spelled in place
const aliased = flag ? {
  C: _Map
} : {
  C: Object
};
export const viaAlias = () => {
  var _ref;
  return _ref = aliased.C, _ref === Object ? _Object$groupBy([1], x => x) : _ref.groupBy([1], x => x);
};
const inSlot = {
  C: flag ? _Iterator : Array
};
export const viaSlot = () => {
  var _ref2;
  return _ref2 = inSlot.C, _ref2 === Array ? _Array$from([1]) : _ref2.from([1]);
};
export const inPlace = () => {
  var _ref3;
  return _ref3 = (flag ? {
    C: _Reflect
  } : {
    C: Object
  }).C, _ref3 === Object ? _Object$getPrototypeOf(x) : _ref3.getPrototypeOf(x);
};