import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Child claims in the initializer and computed key remain live until extraction.
// Sibling initializers retain their source order around the claimed pattern.
const effects = [];
const before = (_pushMaybeArray(effects).call(effects, 'before'), 0),
  _ref = (_pushMaybeArray(effects).call(effects, 'init'), _Array$from([4, 7])),
  method = null == _ref ? _ref[""] : ((_pushMaybeArray(effects) || 0).call(effects, _Array$from('k')[0]), _atMaybeArray(_ref)),
  after = (_pushMaybeArray(effects).call(effects, 'after'), 1);
export { before, method, after, effects };