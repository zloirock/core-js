import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// NEGATIVE: a for-of HEAD binding re-runs per iteration off dynamic iterable values - the
// head's own destructure never judges as a stable Symbol alias
for (const {
  asyncIterator: viaForOfHead = 0
} of [{
  asyncIterator: _Symbol$asyncIterator
}]) {
  _pushMaybeArray(export_).call(export_, [][viaForOfHead]);
}