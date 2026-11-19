import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.to-string";
const registry = {
  C: Symbol
};
const known = registry;
const kept = {};
const elsewhere = flag ? known : kept;
elsewhere.D = userValue;
export const shared = registry.C.for('a');