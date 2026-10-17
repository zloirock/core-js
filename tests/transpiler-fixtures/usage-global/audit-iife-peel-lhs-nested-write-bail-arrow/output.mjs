import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Writes inside assignment targets invalidate the returned-argument proof.
// The local calls keep their arguments in this file; global injection covers the selected
// static keys across the possible receivers without loading whole constructor families.
let x;
// positive controls: non-param write in an LHS default / param read in a key still peel.
// distinct constructors from the bail cells, so a bail regression is visible in the import set
let other = 0;
const okOtherWrite = (arg => {
  ({
    x = other = 1
  } = {});
  return arg;
})(Object);
const {
  groupBy: gb
} = okOtherWrite;
export const r4 = gb([5], v => v);