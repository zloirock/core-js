import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _self from "@core-js/pure/actual/self";
// a PRISTINE proxy-global root reads through its pure import when it has one (`self`),
// bare when it does not (`window`); a pristine proxy HOP is pure navigation and drops
const viaSelf = _getIteratorMethod(_self.inner);
export { viaSelf };