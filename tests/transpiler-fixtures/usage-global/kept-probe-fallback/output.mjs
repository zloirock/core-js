import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// A nullable stored receiver can select its fallback.
// Its store and fallback effects each run once.
let held;
const {
  resolve
} = (held = (note(), globalThis.window))?.Promise || {};
use(resolve, held);