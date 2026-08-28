import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the nested-claim routes are a PURE-flavor emission: this flavor rewrites nothing, so every shape
// they reshape there stays verbatim here and only its module is injected. that is the negative half
// of those routes - a rewrite leaking into this flavor would edit code the user asked to keep
const box = {
  y: [1, [2]]
};
const {
  y: {
    at,
    other
  }
} = box;
const {
  y: {
    flat
  },
  keep
} = box;
const rows = [[1, [2]]];
const [{
  findLast
}] = rows;
export const r = [at, other, flat, keep, findLast];