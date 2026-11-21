import "<CWD>/packages/core-js/modules/es.object.keys.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
function identity(value) {
  return value;
}
const {
    Object: {
      keys
    }
  } = globalThis,
  unclaimed = identity(globalThis).noSuchThing;
export { keys, unclaimed };