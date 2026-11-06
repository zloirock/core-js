import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A polyfilled call buried in an array element's prefix keeps its own substitution.
// The enclosing Map.groupBy read stays native and the prefix runs once in its original slot.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const w = "abc";
const [{
  Map: {
    groupBy
  }
}] = [(eff(_atMaybeString(w).call(w, -1)), _globalThis)];
export { groupBy, seen };