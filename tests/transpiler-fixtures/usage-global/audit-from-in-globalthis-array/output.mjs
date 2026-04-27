import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// BinaryIn RHS via proxy-global member chain: `'from' in globalThis.Array`. plugin
// resolves the chain through proxy-global indirection to the Array constructor leaf,
// then injects the static polyfill (`es.array.from`) plus the proxy-global polyfill
// (`es.global-this`). post-polyfill the runtime check naturally yields true
'from' in globalThis.Array;