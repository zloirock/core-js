import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
// A known computed setter shadows the inherited function and enables the default.
// Only the array default supplies the includes receiver.
const log = [];
const key = "toString";
const box = {
  set [key](value) {}
};
const {
  toString: {
    includes
  } = (log.push("default"), [8, 9])
} = box;
const r = includes.call([8, 9], 9);
export { r };
export const effects = log;