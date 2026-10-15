import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// Static pure bindings remove their unreachable defaults together with the comments inside them.
// Comments on a removed default must not annotate the surviving receiver prefix.
/* receiver prefix */touch();
const of = _Array$of;
/* optional receiver prefix */touch?.();
const from = _Array$from;
/* leading default receiver */touchLeading();
const hasOwn = _Object$hasOwn;
export { of, from, hasOwn };