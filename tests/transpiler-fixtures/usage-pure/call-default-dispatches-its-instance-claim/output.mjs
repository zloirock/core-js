import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
// an instance member destructured through a CALL default (`= fa()`) dispatches on the call's value:
// the call runs once, only where the default fires - top-level, in a function, an assignment and a
// parameter - and a default the host's pairing proves dead is not replaced: the paired value is read
function fa() {
  log();
  return [1, 2];
}
const {
  A: {
    at
  } = {
    at: _atMaybeArray(fa())
  }
} = {};
function h2(o) {
  const {
    A: {
      flat
    } = {
      flat: _flatMaybeArray(fa())
    }
  } = o;
  return flat;
}
function h3(o) {
  let fm;
  ({
    A: {
      flatMap: fm
    } = {
      flatMap: _flatMapMaybeArray(fa())
    }
  } = o);
  return fm;
}
function h4({
  findLast: fl
} = {
  findLast: _findLastMaybeArray(fa())
}) {
  return fl;
}
const w = _withMaybeArray([1, 2]);
use(at, h2, h3, h4, w);