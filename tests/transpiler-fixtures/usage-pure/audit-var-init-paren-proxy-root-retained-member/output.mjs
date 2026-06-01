import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
const from = _Array$from;
// a parenthesized proxy-global root in a retained-receiver init: the polyfilled key (`from`)
// hoists while the unpolyfilled key (`other`) keeps the collapsed receiver. the close paren must
// drop together with the hop so the retained member doesn't leave a dangling open paren
const {
  other
} = _globalThis.Array;
from([1]);
other;