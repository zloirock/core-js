import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Static reads inside instance-call arguments retain their constructor and effects.
const effects = [];
let r;
const out = [];
const o = {
  make() {
    return Array;
  }
};
(_pushMaybeArray(out) || 0).call(out, (o.make(), _Array$from)([3]));
r = out;
export { r, effects };