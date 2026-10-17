import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A constructor element retains its prototype family in patterns and member reads.
// Repeated identical constructors agree; shadowed and mixed elements stay conservative.
for (const R of [Array, Array]) {
  const {
    prototype: {
      at
    }
  } = R;
  R.prototype.includes;
}