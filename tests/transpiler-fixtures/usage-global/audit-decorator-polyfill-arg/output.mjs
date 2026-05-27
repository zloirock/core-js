import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
import "core-js/modules/web.dom-collections.iterator";
// decorator argument is a polyfilled built-in call: the expression inside the
// decorator parens is scanned and rewritten like any other call site.
@inject(new Map())
class C {}