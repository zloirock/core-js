import _Array$from from "@core-js/pure/actual/array/from";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
var _ref;
// a call an open selection of containers is handed to that only reads the slot leaves it unwritten: whichever
// container the selection holds, a static read through the slot after the call is read as one through the
// selection itself, and the static a native owner lacks on the targets is served
const listed = flag ? {
  C: Array
} : {
  C: Object
};
function peek(target) {
  return target.C;
}
peek(listed);
export const copied = (_ref = listed.C, _ref === Array ? _Array$from([1]) : _ref.from([1]));
const counted = flag ? {
  C: Number
} : {
  C: Object
};
function inspect(target) {
  return target.C;
}
inspect(counted);
const {
    C: _ref2
  } = counted,
  isInteger = _ref2 === Number ? _Number$isInteger : _ref2.isInteger;
export { isInteger };