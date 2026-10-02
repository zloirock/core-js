import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// An unknown own key, spread or installed prototype prevents inherited-member narrowing.
// Every multi-family read keeps its conservative fallback.
use(_at({
  [key]: other
}.toString));
use(_includes({
  ...other
}.valueOf));
const box = {};
Object.setPrototypeOf(box, other);
use(box.hasOwnProperty.some);