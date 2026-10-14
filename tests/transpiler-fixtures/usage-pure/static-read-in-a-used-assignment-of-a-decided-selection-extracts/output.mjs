import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a static read through a container a decided selection yields, in an assignment whose value is used,
// extracts through the capture, which yields the selected container: off a ternary, an `&&`, and a `||`
// whose left is a fresh object
let attempt, groupBy, from;
export const viaTernary = () => {
  var _ref;
  return _ref = {
    C: {}
  } = {
    C: _Promise
  }, attempt = _Promise$try, _ref;
};
export const viaAnd = () => {
  var _ref2;
  return _ref2 = {
    C: {}
  } = {
    C: _Map
  }, groupBy = _Map$groupBy, _ref2;
};
export const viaOr = () => {
  var _ref3;
  return _ref3 = {
    C: {}
  } = {
    C: _Iterator
  }, from = _Iterator$from, _ref3;
};
export { attempt, groupBy, from };