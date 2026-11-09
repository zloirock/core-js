import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
// A selected realm alias keeps the constructor namespace for its retained static read.
var root = typeof window !== 'undefined' ? window : undefined;
root.Promise.resolve(1);