import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const log = [];
const [{
  Object: {
    keys,
    ...rest
  }
}] = [(_pushMaybeArray(log).call(log, 'init'), _globalThis)];
const [{
  Object: {
    entries = _pushMaybeArray(log).call(log, 'default'),
    ...remaining
  }
}, tail] = [_globalThis, 1];
export const r = [keys({
  a: tail
}), entries({
  b: 2
}), log, _Object$hasOwn(rest, 'keys'), _Object$hasOwn(remaining, 'entries')];