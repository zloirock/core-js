import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Nested ArrayPattern over an ArrayExpression init with a leading spread: position 1 in
// `[...spread, 'x']` resolves to spread[1] OR 'x' depending on runtime spread.length, so
// resolution must bail rather than narrow to the literal 'x'. distinct .at on `b` and
// .toFixed on `c` make both ends of the bail observable: regression would emit only
// es.string.at (narrow to 'x'), dropping the array and number variants the runtime can hit.
declare const spread: number[];
const [[, b]] = [[...spread, 'x']];
const c = 42;
b.at(-1);
c.toFixed(2);