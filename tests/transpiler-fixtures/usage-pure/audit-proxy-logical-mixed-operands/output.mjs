import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// Each logical operand keeps its own substitution: a realm member lands on the
// backed proxy root, while a constructor operand lands on its pure constructor.
// The selected receiver is evaluated once before binding the polyfilled property
// and copying the remaining keys.
const g = _globalThis;
const {
  from,
  ...rest
} = _self.Array || _Set || _Map;
from([1]);