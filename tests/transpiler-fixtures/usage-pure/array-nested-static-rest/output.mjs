import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Nested statics keep their source hops and object-rest exclusions.
// The initializer prefix runs once before the extracted bindings.
const log = [];
_pushMaybeArray(log).call(log, 'init');
const keys = _Object$keys;
const [{
  Object: {
    keys: _unused,
    ...rest
  }
}] = [_globalThis];
const entries = _Object$entries;
const [{
  Object: {
    entries: _unused2,
    ...remaining
  }
}, tail] = [_globalThis, 1];
export const r = [keys({
  a: tail
}), entries({
  b: 2
}), log, _Object$hasOwn(rest, 'keys'), _Object$hasOwn(remaining, 'entries')];