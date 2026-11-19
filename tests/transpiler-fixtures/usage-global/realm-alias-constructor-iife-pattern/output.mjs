import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// A nested IIFE pattern mirrors the static and keeps the nullable alias read.
const w = globalThis.window;
(({
  resolve: {
    length
  }
}) => length)(w.Promise);