import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// A possibly nullish IIFE receiver keeps the parameter's native null rejection.
// Later arguments finish before the throw; a computed pattern key remains unexecuted.
const events = [];
const receiver = JSON.parse('null');
export let result;
try {
  (({
    [(_pushMaybeArray(events).call(events, 'key'), 'at')]: at
  }, other) => [at, other])((_ref => {
    return _ref == null ? _ref : {
      get at() {
        return _at(_ref);
      }
    };
  })(receiver), _pushMaybeArray(events).call(events, 'argument'));
} catch (error) {
  result = [error instanceof TypeError, events];
}