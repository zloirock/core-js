import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// a parenthesized proxy-global root in a retained-receiver init: the polyfilled key extracts, and the
// unpolyfilled key keeps the receiver in a residual that reads it through the collapsed `self` hop.
const from = _Array$from;
const {
  other
} = _self.Array;
from([1]);
other;