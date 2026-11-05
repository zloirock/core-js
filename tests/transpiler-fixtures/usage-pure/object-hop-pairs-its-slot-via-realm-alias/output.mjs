import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A reassigned realm alias still supplies its current value to the literal slot.
// The nested Map extraction remains native.
let realmAlias = _globalThis;
realmAlias = _self;
const {
  w: {
    Map: viaRealmAlias
  }
} = {
  w: realmAlias
};
export default [viaRealmAlias];