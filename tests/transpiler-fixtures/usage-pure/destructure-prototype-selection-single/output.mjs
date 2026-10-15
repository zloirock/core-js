import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A decided realm selection preserves its effect prefix before the prototype read.
// A single nested instance slot receives the same polyfill as a pair of slots.
const events = [];
class Source {
  static get effect() {
    _pushMaybeArray(events).call(events, 'effect');
    return 0;
  }
}
const at = _atMaybeArray((Source.effect, _globalThis.Array.prototype));
const includes = _includesMaybeString((_pushMaybeArray(events).call(events, "call"), _globalThis.String.prototype));