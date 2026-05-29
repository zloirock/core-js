import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// guard narrows x to string before the loop, but the loop body reassigns x AFTER the use -
// on the next iteration x.at runs on whatever readAnything() returned, so the outside guard's
// narrow can't hold; .at must stay generic (Array|String), not String-only
function process(x, cond) {
  if (typeof x !== "string") return;
  while (cond) {
    x.at(0);
    x = readAnything();
  }
}