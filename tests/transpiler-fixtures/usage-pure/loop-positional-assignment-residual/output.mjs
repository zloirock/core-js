import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
let at, length;
const readers = [];
for (const _ref2 of [[[4, 5]], [[6, 7, 8]]]) {
  var _ref;
  [_ref] = _ref2;
  at = _atMaybeArray(_ref);
  ({
    length
  } = _ref);
  (_pushMaybeArray(readers) || 0).call(readers, [at.call([9], 0), length]);
}
export { at, length, readers };