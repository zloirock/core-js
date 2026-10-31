import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
// A setter-only own slot reads undefined, so the nested array default runs.
// Only the array default supplies the includes receiver.
const log = [];
const box = {
  set toString(value) {}
};
const {
  toString: {
    includes
  } = (log.push("default"), [8, 9])
} = box;
const r = includes.call([8, 9], 9);
export { r };
export const effects = log;