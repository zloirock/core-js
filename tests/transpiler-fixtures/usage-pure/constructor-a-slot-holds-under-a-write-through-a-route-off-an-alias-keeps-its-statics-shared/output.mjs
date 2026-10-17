import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
const registry = {
  C: _Symbol
};
const known = registry;
const kept = {};
const elsewhere = flag ? known : kept;
elsewhere.D = userValue;
export const shared = _Symbol$for('a');