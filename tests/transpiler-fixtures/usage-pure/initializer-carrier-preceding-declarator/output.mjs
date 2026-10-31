import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// The initializer prefix stays after an earlier declarator
// and before the following declarator.
const lead = effect("lead");
const method = _atMaybeArray((effect("init"), _globalThis.Array.prototype));
const tail = effect("tail");
use(lead, method, tail);