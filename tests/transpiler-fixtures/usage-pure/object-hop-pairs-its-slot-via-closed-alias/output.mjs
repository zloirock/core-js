import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a binding reassigned to a realm name from INSIDE a nested function: the write is reachable and
// every reachable value names the realm, so the hop reads it as the flat form does - a static
// claims, an instance key stays native (the realm object carries no `at`)
let closedAlias = _globalThis;
function closeOver() {
  closedAlias = _self;
}
const {
  w: {
    Array: {
      from: viaClosedAlias
    }
  }
} = {
  w: {
    Array: {
      from: _Array$from
    }
  }
};
export default [viaClosedAlias, closeOver];