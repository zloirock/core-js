import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// pragmatic assumption: top-level `this` IS the global proxy regardless of sourceType -
// nobody reads properties off the ESM-undefined `this` on purpose (such a chain is statically
// dead there), while script / CommonJS-shaped code means the global. the chain therefore
// resolves like `globalThis.Array.from(...)`: the static injects and the return type narrows
this.Array.from([1, 2]).at(0);