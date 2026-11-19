import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// The effect prefix precedes the throwing sealed read used by the outer guard.
use((note(), (globalThis.window?.self).self)?.Promise.resolve);