import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// An IIFE destructure param with a DEFAULT, invoked with a proxy-global MEMBER-EXPRESSION call-arg. The
// param-default is a polyfill dead-end for the destructured key(s) (`Object.from` / `Object.of` /
// `Object.allSettled` do not exist), so the live safe-access arg supersedes it and its static polyfill is
// injected. Cases: a direct member, a deeper proxy hop (`globalThis.self.Array`), and a multi-key pattern.
// A default that itself carries a polyfill would instead stay the receiver (the live fallback for an
// undefined call-arg).
const a = (({
  from
} = Object) => from([1]))(globalThis.Array);
const b = (({
  of
} = Object) => of(1, 2))(globalThis.self.Array);
const c = (({
  allSettled,
  any
} = Object) => allSettled([]))(globalThis.Promise);
export { a, b, c };