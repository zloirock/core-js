import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// SYNTH-SWAP: the outcomes are not ranked alternatives, they are chosen PER KEY and coexist in one
// pattern - a polyfillable key leaves the pattern as its own binding, an unknown key stays in the
// pattern with the receiver substituted. a rest element keeps a residual pattern beside the
// extracted binding, and in a parameter default, where no literal can be built, nothing is rewritten
const {
  foo
} = globalThis.Array;
const {
  from
} = globalThis.Array;
const {
  of,
  bar
} = globalThis.Array;
const {
  groupBy,
  ...rest
} = globalThis.Map;
export function g({
  at,
  ...r
} = 'ab') {
  return [at, r];
}
export const a = [foo, from, of, bar, groupBy, rest];