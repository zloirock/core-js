import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A late anchor must not strand the nested static on a narrow constructor.
globalThis.window = globalThis;
let held;
export const {
  Promise: {
    resolve
  }
} = held = globalThis.window?.self;