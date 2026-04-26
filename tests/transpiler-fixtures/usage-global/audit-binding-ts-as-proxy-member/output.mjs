import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/web.self";
// binding via TS `as` cast on a proxy global `(self as any).Promise`: through the alias
// `P`, runtime calls still resolve to the polyfilled `Promise`.
const P = (self as any).Promise;
P.resolve(1);