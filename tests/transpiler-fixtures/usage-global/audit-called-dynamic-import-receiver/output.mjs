import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// a dynamic import that is itself CALLED: `import(...)` names the promise, so calling it yields
// an unmodelled value and its member falls back to the generic receiver fold. Typing the call
// as a promise instead would silently drop every polyfill the member needs. The second pair is
// the control - an uncalled `import(...)` still resolves to a promise and takes `finally`.
const called = import('./mod')(1);
called.at(0);
const awaited = import('./mod');
awaited.finally(() => {});