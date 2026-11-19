import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.global-this";
// Returning a nested assignment preserves the realm and supplies its callable static.
let withResolvers;
function capture() {
  return {
    Promise: {
      withResolvers
    }
  } = globalThis;
}
use(capture(), withResolvers);