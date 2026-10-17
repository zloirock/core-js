import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
// A preceding default can replace the source binding while destructuring it.
// The nested guard and later sibling still read the original captured object.
// A constructor escaping through the getter includes its static methods.
let source = {
  leading: undefined,
  get realm() {
    mark();
    return _globalThis;
  },
  trailing: 2
};
const _ref = source,
  {
    leading = (source = {
      trailing: 'wrong'
    }, 1)
  } = _ref,
  {
    realm: _ref2
  } = _ref,
  Value = _ref2 === _globalThis ? _WeakSet : _ref2.WeakSet,
  {
    trailing
  } = _ref;
export { leading, Value, trailing, source };