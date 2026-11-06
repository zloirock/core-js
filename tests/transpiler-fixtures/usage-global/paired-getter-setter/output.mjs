import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
// A paired getter and setter keep the getter result and skip the nested default.
const log = [];
const box = {
  get toString() {
    log.push("get");
    return [8, 9];
  },
  set toString(value) {}
};
const {
  toString: {
    includes
  } = (log.push("default"), [1])
} = box;
const r = includes.call([8, 9], 9);
export { r };
export const effects = log;