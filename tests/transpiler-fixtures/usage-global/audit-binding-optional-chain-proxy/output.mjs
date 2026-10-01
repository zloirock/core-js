import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/web.self";
// binding via optional chain on a proxy global `self?.Promise`: subsequent uses through
// the alias `P` still resolve to the polyfilled `Promise` constructor.
const P = self?.Promise;
P.resolve(1);