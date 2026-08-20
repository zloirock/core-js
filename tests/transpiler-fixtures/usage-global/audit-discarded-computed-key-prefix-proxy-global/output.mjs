import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// usage-global parity for a PURE proxy-global in a DISCARDED computed-key sequence prefix: usage-global
// resolves the polyfilled static/method through the prefix (injects the import) and keeps the member verbatim
// - it must never strand the proxy-global the way usage-pure's rewrite did (text-composer crash). mirrors the
// pure shape set: instance, static, symbol-iterator, and a mixed side-effect-plus-proxy prefix; bare-global
// and `globalThis.self` hop prefixes both.
let n = 0;
const arr = [[1]];
const instanceKey = arr[globalThis, 'includes'](1);
const staticKey = Array[globalThis.self, 'from']([1, 2]);
const symbolKey = [...arr[globalThis, Symbol.iterator]()];
const mixedSe = arr[n++, globalThis, 'at'](0);
export { instanceKey, staticKey, symbolKey, mixedSe, n };