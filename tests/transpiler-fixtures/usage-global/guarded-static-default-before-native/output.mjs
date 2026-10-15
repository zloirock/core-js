import "core-js/modules/es.array.of";
// A guarded default at the pattern's edge detaches before its native sibling.
// The sibling still reads the captured source after the default rebinds its variable.
let M = pickConstructor();
if (!M) M = Array;
const {
  of: method = (M = {}, 1),
  extra
} = M;
export { method, extra };