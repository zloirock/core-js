import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
// A direct caller captures its prototype receiver before later arguments run.
// Its instance getter stays at the original parameter read.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const prior = _Object$getOwnPropertyDescriptor(Array.prototype, 'includes');
const events = [];
function own() {
  return 'includes';
}
restoreProperty(Array.prototype, 'includes', {
  configurable: true,
  get() {
    _pushMaybeArray(events).call(events, 'includes');
    return own;
  }
});
export let result;
try {
  result = ((_ref, other, _unused = void 0) => {
    let includes = _includesMaybeArray(_ref);
    return [includes, other];
  })(Array.prototype, _pushMaybeArray(events).call(events, 'argument'));
} finally {
  restoreProperty(Array.prototype, 'includes', prior);
}