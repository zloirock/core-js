import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Finite computed keys contribute every reachable static method in global output.
// Array-wrapper and inline-argument sources select their slots without releasing the whole family.
// Pure preserves these native patterns where no single key can be substituted.
[{
  [flag ? "from" : "of"]: viaArrayWrap
} = {}] = [Array];
(function ({
  [flag ? "assign" : "entries"]: viaIife
}) {})(Object);
({
  [flag ? "fromEntries" : "values"]: viaAssign
} = Object);