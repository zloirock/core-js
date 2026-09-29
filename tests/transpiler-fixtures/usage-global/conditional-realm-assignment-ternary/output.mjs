import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.global-this";
// A ternary arm extracts the constructor while keeping the assignment's realm value.
function read(enabled) {
  let C;
  const realm = enabled ? {
    Promise: C
  } = globalThis : null;
  return enabled ? [realm === globalThis, typeof C.try] : realm;
}
export const result = [read(true), read(false)];