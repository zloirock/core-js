import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// computed bracket access on a proxy global `globalThis['Array'].from(...)`: the static
// member is still recognised as `Array.from` and rewritten to the polyfill.
globalThis["Array"].from([1]);
globalThis["self"]["Object"].keys("abc");