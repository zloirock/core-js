// the pure method's output re-fed to the plugin, as a library published pre-polyfilled against @core-js/pure
// ships it: for a constructor the build is told not to inject, a rest hop keeps a sentinel in each claimed
// leaf's place beside the static's own extraction. the sentinel is our own spelling, beside a live leaf as much
// as alone, so a second pass extracts nothing again and leaves every line as it is
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
const groupBy = _Map$groupBy;
const Kept = _Set;
const {
  Map: {
    groupBy: _unused,
    ...grouped
  } = _Set
} = _globalThis;
const any = _Promise$any;
const {
  Promise: {
    any: _unused2,
    prototype: {
      catch: rescue
    },
    ...pooled
  } = _Set
} = _self;
const attempt = _Promise$try;
const {
  Promise: {
    try: _unused3,
    prototype: {
      then
    },
    ...tried
  }
} = _globalThis;
export { groupBy, grouped, Kept, any, rescue, pooled, attempt, then, tried };