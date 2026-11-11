import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// Reanchoring a pattern-valued extraction preserves its source getter.
const realm = {
  get value() {
    effect();
    return _globalThis;
  }
};
let custom;
realm.value;
({
  custom
} = _Map);
use(custom);