import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// ... and a node the channel SYNTHESIZES off that receiver inherits the frame the same way: the
// sealed-nav probe is planned on the pristine tree and its guard object is a CLONE, so an unstamped
// copy tested `globalThis.window` through the parameter and shipped a raw global read
const viaSealedNav = function ({
  from
} = Object, globalThis) {
  return from;
}(((null == _globalThis.window ? void 0 : _self).Array, {
  from: _Array$from
}));
export { viaSealedNav };