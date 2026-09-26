import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// The wrapper evaluates its elements in order before any property reads.
// A captured element is shared by the extracted method and the native length binding.
const log = [];
const rows = [[1, 2]];
const [, _ref] = [_pushMaybeArray(log).call(log, 'n'), _flatMaybeArray(rows).call(rows)];
const behindEffect = _atMaybeArray(_ref);
const {
  length: behindLength
} = _ref;
const [, _ref2] = [rows, _flatMaybeArray(rows).call(rows)];
const behindPure = _atMaybeArray(_ref2);
const {
  length: pureLength
} = _ref2;
export const r = [behindEffect(0), behindLength, behindPure(0), pureLength, log.length];