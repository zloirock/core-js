import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
// a binding REASSIGNED between realm names holds one object under several spellings, so a read
// through it answers the same whichever write reached the use - the claim stands
let realmAlias = _globalThis;
realmAlias = _self;
const {
  w: {
    Map: viaRealmAlias
  }
} = {
  w: {
    Map: _Map
  }
};
export default [viaRealmAlias];