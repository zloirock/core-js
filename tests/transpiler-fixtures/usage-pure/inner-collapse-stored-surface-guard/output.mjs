import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A stored realm surface still performs its following window probe.
// Closed-over alias reads must not turn that probe into an always-defined value.
const log = [];
export const result = (() => {
  let inner, stored;
  const holder = {
    set value(value) {
      _pushMaybeArray(log).call(log, 'set');
      stored = value;
    }
  };
  const value = null == (_pushMaybeArray(log).call(log, 'before'), holder.value = (_pushMaybeArray(log).call(log, 'between'), inner = (_pushMaybeArray(log).call(log, 'inside'), _self))).window ? void 0 : _Array$from((_pushMaybeArray(log).call(log, 'argument'), [7]));
  return [value, inner === _globalThis, stored === _globalThis];
})();
export const effects = log;