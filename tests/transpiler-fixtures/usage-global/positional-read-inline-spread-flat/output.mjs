import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// every POSITIONAL read of a literal list expands an inline-array spread the same way: the type
// layer's element reads, the call-argument reads a return type follows, the presence of a slot
// value, the proxy-global pairing, a common element type. one method per row, so a row's narrowing
// is attributable to its own read; a spread of a BINDING leaves no static position past it
function pp({
  x
}) {
  return x;
}
// NEGATIVES: a spread of a binding at or before the slot - no static position, the generic dispatch
const viaPatternParamAlias = pp(...wrapped);
viaPatternParamAlias.flat();
viaPatternParamAlias.at(0);
export { viaPatternParamAlias };