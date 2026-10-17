import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2, _ref5;
// a destructure reading a static off a member of a selection of containers reads one arm's constructor
// per pass, so the static takes the identity guard its member spelling takes, over a receiver read once:
// flat off a held selection or one spelled in place, as an assignment, into a pattern, and nested off a
// held selection
const box = flag ? {
  C: _Map
} : {
  C: Object
};
export const groupBy = (_ref = box.C, _ref === Object ? _Object$groupBy : _ref.groupBy);
export const from = (_ref2 = (flag ? {
  C: _Iterator
} : {
  C: Array
}).C, _ref2 === Array ? _Array$from : _ref2.from);
let isInteger;
export const assign = () => {
  var _ref3;
  return isInteger = (_ref3 = (flag ? {
    C: Number
  } : {
    C: _Promise
  }).C, _ref3 === Number ? _Number$isInteger : _ref3.isInteger), _ref3;
};
const shelf = flag ? {
  C: Object
} : {
  C: _Set
};
const {
    C: _ref4
  } = shelf,
  fromEntries = _ref4 === Object ? _Object$fromEntries : _ref4.fromEntries;
export { fromEntries };
const desk = flag ? {
  C: _Promise
} : {
  C: Object
};
export const {
  length: arity
} = (_ref5 = desk.C, _ref5 === Object ? _Object$assign : _ref5.assign);