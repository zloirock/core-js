import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
const {
  resolve
} = (globalThis.window?.self).Promise ?? {};
r = typeof resolve;