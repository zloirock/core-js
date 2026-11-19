import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A repeated or memoized receiver retains the full type-level parameter patterns.
const handlers = [(n: number) => n + 1];
export const last = (handlers as Array<(...values: number[]) => number>).at(-1);
const make = ([a, b]: number[]) => [a, b];
export const pair = (make as ([a, b]: number[]) => number[])([3, 4]).includes(4);
const object = ({
  value
}: {
  value: number;
}) => [value];
export const flat = (object as ({
  value
}: {
  value: number;
}) => number[])({
  value: 5
}).flat();