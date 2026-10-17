import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.constructor";
export class Pending {
  static make({
    Promise: {
      withResolvers
    } = Number
  } = globalThis) {
    return withResolvers;
  }
}