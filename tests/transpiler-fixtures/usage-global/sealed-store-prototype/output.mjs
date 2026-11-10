import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A constructor fallback keeps the read through the seal before its prototype.
let held;
use(((held = globalThis.window)?.self).Promise.prototype.finally);