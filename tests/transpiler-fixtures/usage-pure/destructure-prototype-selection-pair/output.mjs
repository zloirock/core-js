import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A decided realm selection evaluates its prefix once before both instance reads.
const events = [];
class Source {
  static get effect() {
    _pushMaybeArray(events).call(events, 'effect');
    return 0;
  }
}
const {
    prototype: _ref
  } = (Source.effect, _globalThis.Array),
  at = _atMaybeArray(_ref),
  flat = _flatMaybeArray(_ref);