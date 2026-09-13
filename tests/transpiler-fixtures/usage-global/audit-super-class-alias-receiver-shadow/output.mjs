import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// Each superclass alias resolves in its declaration scope despite the later local shadow.
// The first captures userLibrary.Promise; the second captures the global Promise.
// Returning the global subclass requires its full static family, masking the negative race row.
// The pure counterpart distinguishes the two super receivers directly.

// This alias captures userLibrary.Promise and adds no global Promise claim of its own.
var recvA = userLibrary;
var memberAlias = recvA.Promise;
function memberSuper() {
  var recvA = globalThis;
  return class extends memberAlias {
    static build() {
      return super.race([]);
    }
  };
}

// the receiver is the global at the declaration, so the destructured super-class DOES resolve - the
// constructor family and `super.allSettled` inject, and the inner shadow must not suppress them
var recvB = globalThis;
var {
  Promise: destructureAlias
} = recvB;
function destructureSuper() {
  var recvB = userLibrary;
  return class extends destructureAlias {
    static build() {
      return super.allSettled([]);
    }
  };
}
export { memberSuper, destructureSuper };