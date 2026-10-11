import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
import _trimEndMaybeString from "@core-js/pure/actual/string/instance/trim-end";
// a sequence prefix reading a literal's getter keeps the read when a spread or an unknown key follows the
// getter: what follows may not spell the key, so the getter may still run. a data property or a lone
// setter before the spread runs nothing on the read, and leaves
const viaSpread = {
  get value() {
    log();
    return 0;
  },
  ...extra
};
export const at = _atMaybeString((viaSpread.value, String.prototype));
const viaKey = {
  get value() {
    log();
    return 0;
  },
  [key]: 1
};
export const includes = _includesMaybeArray((viaKey.value, Array.prototype));
const data = {
  value: 0,
  ...extra
};
export const padEnd = _padEndMaybeString(String.prototype);
const quiet = {
  set mode(v) {
    log(v);
  },
  ...extra
};
export const trimEnd = _trimEndMaybeString(String.prototype);