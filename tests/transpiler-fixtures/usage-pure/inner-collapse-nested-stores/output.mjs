import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _self from "@core-js/pure/actual/self";
// A nested store remains one expression below the realm navigation.
// Prefixes and the setter run once; an absent window skips the argument.
const log = [];
let inner, stored;
const holder = {
  set value(value) {
    _pushMaybeArray(log).call(log, 'set');
    stored = value;
  }
};
const result = null == (_pushMaybeArray(log).call(log, 'before'), holder.value = (_pushMaybeArray(log).call(log, 'between'), inner = (_pushMaybeArray(log).call(log, 'inside'), _self))).window ? void 0 : _Array$from((_pushMaybeArray(log).call(log, 'argument'), [7]));
consume(result, inner, stored, log);