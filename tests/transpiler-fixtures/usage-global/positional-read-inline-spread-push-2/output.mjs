import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the mutation census pairs the pattern at the same positions: the element an alias re-homes
// escapes through the inline spread as it does through the flat literal, and every element from a
// binding spread on escapes into any later slot (`values` / `entries` are the carriers)
const box = [[1]];
const [viaCensusShifted] = [...wrapped, box];
viaCensusShifted.push('s');
for (const item of box) item.at(0);
export { viaCensusShifted };