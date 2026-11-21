import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
const log = [];
const first = new function ({
  from,
  [(log.push("key"), "extra")]: extra
} = Array) {
  this.read = () => typeof from === "function" ? from([1])[0] : typeof from;
  this.extra = extra;
}();
const Again = first.constructor;
const custom = {
  get from() {
    log.push("get");
    return () => [9];
  },
  extra: 4
};
const second = new Again(custom);
export const result = [first.read(), second.read(), second.extra, new Again(undefined).read(), new Again({}).read(), log];