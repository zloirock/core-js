import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// a call returning the realm, with an effect of its own, destructured beside a sibling hop: the
// whole init memoizes once for the sibling and the claim reads the realm the call returns. the memo
// already ran the call, so no extraction replays it as a prefix - that would run it twice. a
// prefixed init and a defaulted sibling take the same shape
function mk() {
  eff();
  return globalThis;
}
const {
  Array: {
    prototype: {
      flat
    }
  },
  Object: o
} = mk();
const {
  String: {
    prototype: {
      at
    }
  },
  z = 1
} = (eff(), mk());