import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A closure can reassign the alias stored in a literal container.
// The native nested static read preserves the value captured by that container.
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
  w: closedAlias
};
export default [viaClosedAlias, closeOver];