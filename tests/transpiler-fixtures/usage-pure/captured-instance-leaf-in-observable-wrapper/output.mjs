import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
const _ref = [1];
// A sole instance leaf dispatches on its captured literal while its surrounding wrapper
// keeps spread evaluation, native iteration and outer computed keys. The consumed leaf
// must not perform another native method read beside the dispatch.
const {
  0: {}
} = [...[_ref]];
const fromSpread = _toSplicedMaybeArray(_ref);
const _ref2 = [1, 2];
const {
  w: {}
} = {
  ...spread,
  w: _ref2
};
const fromObjectSpread = _atMaybeArray(_ref2);
const {
    [(mark(), 'w')]: _ref3
  } = {
    ...spread,
    w: [1, 2]
  },
  afterOuterKey = _includesMaybeArray(_ref3);
if (ok) var _ref4 = [1, 2],
  {
    w: {}
  } = {
    ...spread,
    w: _ref4
  },
  inConditionalBody = _findLastMaybeArray(_ref4);
export { fromSpread, fromObjectSpread, afterOuterKey, inConditionalBody };