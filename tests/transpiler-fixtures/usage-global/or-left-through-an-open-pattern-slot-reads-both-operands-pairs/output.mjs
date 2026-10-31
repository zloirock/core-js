import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
let pair = {
  C: WeakSet
};
if (flag) pair = {
  C: null
};
const {
  C: Q
} = pair;
export const pairs = (Q || Object).entries;