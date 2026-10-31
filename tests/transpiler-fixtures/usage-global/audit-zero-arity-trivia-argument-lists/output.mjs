import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the global counterpart: trivia between the parens must not disturb DETECTION either. this flavor
// rewrites no call, so the separator question cannot arise here - what the import set proves is that
// a comment or a line break in place of an argument list still resolves each method to its module.
// one method per line, since a shared method would collapse into one import and mask its neighbour.
const arr = [[1]];
const str = 'abc';
export const flattened = arr.flat(/* depth */);
export const picked = arr.at();
export const found = arr.findLast(// predicate
);
export const padded = str.padStart(/* width */);
export const built = Array.from(/* source */);
export const mapped = new Map(/* entries */);