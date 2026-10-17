import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.global-this";
export const viaArgument = function ({
  Promise: {
    reject
  } = Reflect
}) {
  return reject;
}(globalThis);