import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const log = [];
const first = new function ({
  from,
  [(_pushMaybeArray(log).call(log, "key"), "extra")]: extra
} = (Array, {
  from: _Array$from,
  get "extra"() {
    return Array["extra"];
  }
})) {
  this.read = () => typeof from === "function" ? from([1])[0] : typeof from;
  this.extra = extra;
}();
const Again = first.constructor;
const custom = {
  get from() {
    _pushMaybeArray(log).call(log, "get");
    return () => [9];
  },
  extra: 4
};
const second = new Again(custom);
export const result = [first.read(), second.read(), second.extra, new Again(undefined).read(), new Again({}).read(), log];