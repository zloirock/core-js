import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
// flatten + TWO sibling block-body IIFEs, each with its own instance method requiring
// `_ref` injection. consumeRefBindingsInRange must scope binding consumption to each
// sibling's range independently - cross-pollution would inject _ref into wrong sibling
const from = _Array$from;
const kls1 = (() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })(),
  kls2 = (() => {
    var _ref2;
    return _keysMaybeArray(_ref2 = []).call(_ref2);
  })();
export { from, kls1, kls2 };