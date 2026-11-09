import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// computed-key BinaryIn LHS through a proxy global: `globalThis['from'] in Array`.
// LHS string-literal access via globalThis chain doesn't fold to a polyfill candidate
// (the key resolves to runtime value, not the static `'from'` key on Array). plugin
// registers the proxy-global polyfill and the possible Array statics for the opaque key,
// without folding the in-expression to true
globalThis['from'] in Array;