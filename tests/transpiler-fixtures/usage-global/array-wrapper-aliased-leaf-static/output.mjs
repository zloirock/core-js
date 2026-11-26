import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global twin of the usage-pure array-wrapper-aliased-leaf-static fixture: the const-alias leaf
// (`const A = Array; const [{ from }] = [A]`) must resolve to Array. Only the static read can inject `es.array.of`.
// regression: the raw-name-only Identifier leaf branch dropped the dependency for the alias in both plugins
const A = Array;
const [{
  from,
  of
}] = [A];
from([1, 2]);
of(1, 2);