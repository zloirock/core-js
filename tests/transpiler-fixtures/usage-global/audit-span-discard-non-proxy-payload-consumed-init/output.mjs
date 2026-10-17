import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.promise.constructor.js";
import "<CWD>/packages/core-js/modules/es.promise.catch.js";
import "<CWD>/packages/core-js/modules/es.promise.finally.js";
import "<CWD>/packages/core-js/modules/es.array.of.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// a fully-consumed destructure drops its init WHOLE, and the sequence prefix sits under the member
// spine where the top-level peel never reaches it
export const consumedInit = (() => {
  const {
    of
  } = ({
    p: Promise
  }, globalThis).self.Array;
  return typeof of;
})();