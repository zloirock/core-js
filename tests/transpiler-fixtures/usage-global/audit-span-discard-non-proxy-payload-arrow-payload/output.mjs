import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.promise.constructor.js";
import "<CWD>/packages/core-js/modules/es.promise.catch.js";
import "<CWD>/packages/core-js/modules/es.promise.finally.js";
import "<CWD>/packages/core-js/modules/es.promise.resolve.js";
import "<CWD>/packages/core-js/modules/es.array.of.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/web.self.js";
export const arrowPayload = (() => Promise.resolve(1), globalThis).self.Array.of(3);