import "<CWD>/packages/core-js/modules/es.object.freeze.js";
import "<CWD>/packages/core-js/modules/es.object.from-entries.js";
import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.array.iterator.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
function identity(value) {
  return value;
}
const {
    Object: {
      freeze
    }
  } = globalThis,
  callArgStatic = identity(globalThis).Object.fromEntries([]);
export { freeze, callArgStatic };