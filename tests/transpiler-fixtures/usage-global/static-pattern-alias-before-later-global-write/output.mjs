import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// An earlier destructured static call retains its array result.
const {
  from
} = Array;
export const result = from(input).at(-1);
if (flag) globalThis.Array = other;