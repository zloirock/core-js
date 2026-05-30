import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Destructured static method (`from`) whose receiver is a const aliasing a proxy-global
// member (`globalThis.Array`). The alias resolves through the proxy-global to the Array
// constructor, pairing the destructured key for the static polyfill (`es.array.from`) and
// pulling the proxy-global polyfill (`es.global-this`). babel and unplugin agree on imports.
const wrapper = globalThis.Array;
const {
  from
} = wrapper;
from([1]);