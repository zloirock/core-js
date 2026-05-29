import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// for-of loop with a back-edge reassign of the guarded binding after the use - same loop-carry
// rule as while: the outside guard can't re-narrow per iteration, so .at stays generic
function process(items, x) {
  if (typeof x !== "string") return;
  for (const item of items) {
    x.at(0);
    x = item;
  }
}