import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `from` here is destructured from the Array constructor itself (Array.from),
// but used only as a binding, never invoked - polyfill must not be injected
for (var {
  from
} of [Array]) {
  record(from);
}