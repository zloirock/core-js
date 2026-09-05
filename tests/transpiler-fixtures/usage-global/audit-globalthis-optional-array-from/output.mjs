import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// `globalThis?.Array.from(...)` proxy access via optional chain: the static method is
// still recognised as `Array.from` and rewritten to the polyfill.
globalThis?.Array?.from([1]);
globalThis?.Object.keys("abc");
self?.Promise?.resolve(1);