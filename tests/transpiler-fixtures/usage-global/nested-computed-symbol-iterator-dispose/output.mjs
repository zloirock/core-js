import "core-js/modules/es.symbol.dispose";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// chained computed Symbol-keyed accesses: optional `[Symbol.iterator]()` returns a
// disposable resource whose `[Symbol.dispose]` is then read. Two separate well-known-
// symbol polyfills must be detected on the chain
obj[Symbol.iterator]?.()[Symbol.dispose];